var express = require('express');
var router = express.Router();
var rp = require('request-promise');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login',function(req,res,next) {
  checkUserIdentity(req.cookies.Authorization,"login",function(identity){
    if(identity == "anon user" || identity == "user token expired") {
        res.render('login',{active_login: true});
    }
    else if(identity == "authenticated user") {
        res.redirect('../user_home');
    }
  });

});

router.get('/register',function(req,res,next) {
  checkUserIdentity(req.cookies.Authorization,"register",function(identity) {
    if(identity == "anon user" || identity == "user token expired") {
        res.render('register',{active_register: true});
    }
    else if(identity == "authenticated user") {
        res.redirect('../user_home');
    }
  });
  //res.render('register',{active_register: true});
});

router.post('/login',function(req,res,next) {
  var username = req.body.username;
  var password = req.body.password;

  var login = {
      method: 'POST',
      uri: "http://auth.app.hasura.me/login",
      //resolveWithFullResponse: true,
      body: {
          username : username,
          password: password
      },
      json: true // Automatically stringifies the body to JSON
    };

  rp(login).then(function (response) {
      //login successfull
      console.log(response);
      var user_id = response.hasura_id;
      var user_token = "Bearer " + response.auth_token;
      res.cookie("userId", user_id);
      res.cookie("userName",username);
      res.cookie("Authorization" , user_token);
      res.redirect('../user_home');
      //res.render('dashboard',{logged_in: true, active_home: true});
  })
  .catch(function (err) {
    //login not successfull
      if(err.statusCode == 403){
          var cred_error = "Incorrect credentials. Please Try again."
         res.render('login',{active_login: true , error: cred_error , persisted_username: username });
      }
  });

});

router.post('/register',function(req,res,next){
  var name = req.body.name;
  var username = req.body.user_name;
  var email = req.body.email;
  var password = req.body.user_password;
  var password2 = req.body.confirm_password;
  var persistent_data = {};
  persistent_data.name = name;
  persistent_data.email = email;
  persistent_data.username = username;

  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('email','Email is required').notEmpty()
     .isEmail().withMessage("Not a Valid Email");
  req.checkBody('user_name','Username is required').notEmpty();
  req.checkBody('user_password','Password is required').notEmpty();
  req.checkBody('confirm_password','Password do not match').equals(req.body.user_password);

  req.getValidationResult().then(function(result) {
      if(!result.isEmpty()) {
          console.log("there are validation errors");
          console.log(result.isEmpty());
          var errors = result.mapped();
          result = {};
          res.render('register',{active_register: true, errors: errors , data: persistent_data});
      }
     else {
          console.log("no errors :)");
          console.log("making request to auth endpoint-------------------------------------")
          //Send an api call to hasura auth and then redirect
          var signup = {
              method: 'POST',
              uri: "http://auth.app.hasura.me/signup",
              body: {
                  username : username,
                  email : email,
                  password: password
              },
              json: true // Automatically stringifies the body to JSON
            };

          rp(signup)
              .then(function (response) {
                  // User account created proceed with further actions
                  //var data = JSON.parse(response.trim());
                  var user_id = response.hasura_id;
                  var user_token = "Bearer " + response.auth_token;
                  res.cookie("Authorization" , user_token);
                  res.cookie("userName",username);
                  res.cookie("userId",user_id);
                  console.log(response,user_id);

                  //Register this user in app_user table
                  var reg_app_user = {
                      method: 'POST',
                      uri:"http://data.app.hasura.me/v1/query",
                      headers: {
                        "Authorization": user_token
                      },
                      body: {
                          type: "insert",
                          args: {
                            table: "app_user",
                            objects: [
                                {
                                  id: user_id,
                                  name: name,
                                  username: username
                                }
                            ]
                          }
                      },
                      json: true
                  };

                  rp(reg_app_user).then(function(response){
                    //Set the cookie and take the user to their dashboard after sign up
                      res.redirect('../user_home');

                  })
                  .catch(function(err){
                    //User cannot be registered in app_user table due to some errors
                    console.log("succesfully signed up but error in storing info in app_user");
                    console.log(err);
                  });

              })
              .catch(function (err) {
                  console.log("resolve this error");
                  // User account cannot be created due to some errors
                  console.log(err);
                  var error_code = err.statusCode;
                  var error_mess = err.error.message;
                  if(error_code == 400) {
                    //Fix for password too short
                    res.render('register',{active_register: true, pass_err: error_mess  });
                  }
                  else if(error_code == 409) {
                    //Fix for username or email clash
                    if(error_mess.indexOf('username') >= 0){
                      //username is clashing
                      var usrnme_err = "User name already exists"
                      res.render('register',{active_register: true, username_err: usrnme_err , data: persistent_data});
                    }
                    else{
                      var mail_err = "This email is already registered"
                      res.render('register',{active_register: true, email_err: mail_err , data: persistent_data});
                    }
                  }

              });
       }
   });


});

function checkUserIdentity(authToken,from,callback) {
  //check for user identity and then redirect accordingly
  if( typeof authToken != "undefined") {
    //cookie present,now check for if user with this cookie is present
    var token = authToken.split(" ");
    var user_info = {
        method: 'GET',
        uri: "http://auth.app.hasura.me/user/account/info",
        //Add the Header entry with the bearer token
        headers: {
          "Authorization": authToken
        },
        json: true // Automatically stringifies the body to JSON
      };

    rp(user_info).then(function(response){
      //token[1] contains the actual token value
      if(response.auth_token == token[1]) {
        //Cookie matches,now send user to his home page.
        console.log("Response from: " + from + " authenticated user");
        callback("authenticated user");
        //res.redirect("../user_home");
      }

      else {
        console.log("Response from: " + from + " Token expired");
        callback("user token expired");
      }

    })
    .catch(function(err){
      //user with this cookie does not exists
      console.log(err);
    });
  }
  else {
    // no cookie found
    console.log("Response from: " + from + " No cookie found");
    //res.render('index', { active_home: false});
    callback("anon user");
  }
}

module.exports = router;
