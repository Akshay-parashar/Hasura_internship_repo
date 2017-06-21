var express = require('express');
var router = express.Router();
var rp = require('request-promise');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.send("Hello User, welcome to user_home page");
  console.log(req.cookies);
  console.log(req.cookies.Authorization);
  res.render('dashboard',{logged_in: true, active_home: true});
});

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

module.exports = router;
