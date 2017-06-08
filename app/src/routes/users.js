var express = require('express');
var router = express.Router();


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
          var xhr = new XMLHttpRequest();
          var url = "http://auth.testapp.vcap.me/signup";
          xhr.open("POST",url,true);
          xhr.setRequestHeader("Content-type","application/json");
          xhr.onreadystatechange = function(){
            if(xhr.readyState == 4 && xhr.status == 200){
              var json = JSON.parse(xhr.responseText);
              console.log("This is the response from server" + JSON.stringify(json));
              //alert(JSON.stringify(json.message));
            }
            else if(xhr.readyState ==4){
              var json = JSON.parse(xhr.responseText);
              console.log("Consoled Error : "+JSON.stringify(json.message));
            }
          }
          var data = {};
          data["username"] = username;
          data["email"] = email;
          data["password"] = password;
          console.log(JSON.stringify(data));
          var payload = JSON.stringify(data);
          console.log(data);
          console.log(jsoninsert);
          xhr.send(jsoninsert);

       }
   });


});

module.exports = router;
