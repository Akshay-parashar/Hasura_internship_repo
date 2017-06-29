var express = require('express');
var router = express.Router();
var rp = require('request-promise');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.cookies);
  console.log(req.cookies.Authorization);
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
      //Make the necessary request to get the data
      var data_user_stats;
      var data_user_images = [];

      var user_stats_req = {
          method: 'POST',
          uri:"http://data.c100.hasura.me/v1/query",
          headers: {
            "Authorization": req.cookies.Authorization
          },
          body: {
            type: "select",
            args: {
              table: "user_stats",
              columns: ["*"],
              where: {id: req.cookies.userId }
            }
          },
          json: true
      };

      var user_images_req = {
          method: 'POST',
          uri:"http://data.c100.hasura.me/v1/query",
          headers: {
            "Authorization": req.cookies.Authorization
          },
          body: {
            type: "select",
            args: {
              table: "photo",
              columns: ["*"],
              where: {poster_id: req.cookies.userId }
            }
          },
          json: true
      };



      rp(user_stats_req).then(function (response){
        console.log("succesfully retrieved some user data");
        console.log(response[0]);
        data_user_stats = response[0];
        /*console.log(response[0].id);
        console.log(response[0].name);
        console.log(response[0].photos);*/
        rp(user_images_req).then(function (response){
          console.log("succesfully retrieved user images");
          response.forEach( function (image){
          data_user_images.push(image.content);
          });
          console.log("---------------");
          console.log(data_user_images);

        })
        .catch(function(err){
          console.log("There was some error retrieving user images");
          console.log(err);
        });

      })
      .catch(function(err){
        console.log("There was some error retrieving user data");
        console.log(err);
      });

        res.render('profile',{logged_in: true, active_profile: true});
    }
  });

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
    res.clearCookie("userId");
    res.clearCookie("userName");
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
