var express = require('express');
var router = express.Router();
var rp = require('request-promise');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.cookies);
  console.log(req.cookies.Authorization);
  //res.send("Hello User, welcome to user_home page");
  checkUserIdentity(req.cookies.Authorization,"user_home ",function(identity){
    if(identity == "anon user" || identity == "user token expired") {
        res.redirect('../');
    }
    else if(identity == "authenticated user") {
        res.render('dashboard',{logged_in: true, active_home: true});
    }
  });

});

router.get('/profile',function(req,res) {
  //Role based access on the view
  checkUserIdentity(req.cookies.Authorization,"profile ",function(identity){
    if(identity == "anon user" || identity == "user token expired") {
        res.redirect('../');
    }
    else if(identity == "authenticated user") {
        res.render('profile',{logged_in: true, active_profile: true});
    }
  });
  //res.render('profile',{active_profile: true});

})

// router.get('/dashboard', function(req, res, next) {
//   res.send("Hello User, this your personal dashboard");
// });

router.get('/logout',function(req,res,next){
  //Perform the logout request to auth endpoint and then set appt flags and then redirect
  var logout = {
      method: 'POST',
      uri: "http://auth.c100.hasura.me/user/logout",
      //Add the Header entry with the bearer token
      headers: {
        "Authorization": req.cookies.Authorization
      },
      json: true // Automatically stringifies the body to JSON
    };

  rp(logout).then(function(response){
    //succesfully logged out user
    console.log(response);
    res.clearCookie("Authorization");
    //redirect to home page of application
    res.redirect('../');
  })
  .catch(function(err){
    //there was some error logging out the user
    console.log(err);
  });

});

function checkUserIdentity(authToken,from,callback) {
  //check for user identity and then redirect accordingly
  if( typeof authToken != "undefined") {
    //cookie present,now check for if user with this cookie is present
    var token = authToken.split(" ");
    var user_info = {
        method: 'GET',
        uri: "http://auth.c100.hasura.me/user/account/info",
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
