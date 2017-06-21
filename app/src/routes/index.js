var express = require('express');
var router = express.Router();
var rp = require('request-promise');

/* GET home page. */
router.get('/', function(req, res) {
  //check for user identity and then redirect accordingly
  checkUserIdentity(req.cookies.Authorization,"root",function(identity){
    if(identity == "anon user" || identity == "user token expired") {
        res.render('index',{active_about: true});
    }
    else if(identity == "authenticated user") {
        res.redirect('../user_home');
    }
  });

});

router.get('/about', function(req, res, next) {
  checkUserIdentity(req.cookies.Authorization,"about",function(identity){
    if(identity == "anon user" || identity == "user token expired") {
        res.render('about',{active_about: true});
    }
    else if(identity == "authenticated user") {
        res.redirect('../user_home');
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
