var express = require('express');
var router = express.Router();
var rp = require('request-promise');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login',function(req,res,next) {
  res.render('login',{active_login: true});
});

router.get('/register',function(req,res,next) {
  res.render('register',{active_register: true});
});

router.post('/login',function(req,res,next) {
  var username = req.body.username;
  var password = req.body.password;

  var login = {
      method: 'POST',
      uri: "http://auth.c100.hasura.me/login",
      body: {
          username : username,
          password: password
      },
      json: true // Automatically stringifies the body to JSON
    };

  rp(login).then(function (response) {
      //login successfull
      console.log(response);
      res.redirect('../user_home');
  })
  .catch(function (err) {
    //login not successfull
      console.log(err);

  });

});

router.post('/register',function(req,res,next){
  var name = req.body.name;
  var username = req.body.user_name;
  var email = req.body.email;
  var password = req.body.user_password;
  var password2 = req.body.confirm_password;

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
          res.render('register',{active_register: true, errors: errors });
      }
     else {
          console.log("no errors :)");
          //Send an api call to hasura auth and then redirect
          var signup = {
              method: 'POST',
              uri: "http://auth.c100.hasura.me/signup",
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
                  console.log(response,user_id);

                  //Register this user in app_user table
                  var reg_app_user = {
                      method: 'POST',
                      uri:"http://data.c100.hasura.me/v1/query",
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
                                  name: name
                                }
                            ]
                          }
                      },
                      json: true
                  };

                  rp(reg_app_user).then(function(response){
                    //Take the user to their dashboard after sign up
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
              });
       }
   });


});

module.exports = router;
