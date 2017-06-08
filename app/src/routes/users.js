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
          var options = {
              method: 'POST',
              uri: "http://auth.vcap.me/signup",
              body: {
                  username : username,
                  email : email,
                  password: password
              },
              json: true // Automatically stringifies the body to JSON
            };

          rp(options)
              .then(function (parsedBody) {
                  // User account created proceed with further actions

              })
              .catch(function (err) {
                  // User account cannot be created due to some errors
                  console.log(err);
              });

              // rp('http://www.google.com')
              // .then(function (htmlString) {
              //     // Process html...
              //     console.log("rp success");
              //     console.log(htmlString);
              // })
              // .catch(function (err) {
              //     // Crawling failed...
              //     console.log("rp sucks");
              //     console.log(err);
              // });

       }
   });


});

module.exports = router;
