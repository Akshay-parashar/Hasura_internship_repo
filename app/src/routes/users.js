var express = require('express');
var router = express.Router();
//var user_model = require('../models/user_model');
//var expressvalidator = require('express-validator');

/*user_model.conn.then(function(){
    user_model.Article.create({
      title: 'Demo title',
      body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    });
});*/

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
  // var name = req.body.name;
  // var username = req.body.user_name;
  // var email = req.body.email;
  // var password = req.body.user_password;
  // var password2 = req.body.confirm_password;
  //
  // req.checkBody('name','Name is required').notEmpty();
  // req.checkBody('email','Email is required').notEmpty()
  // .isEmail().withMessage("Not a Valid Email");
  // req.checkBody('user_name','Username is required').notEmpty();
  // req.checkBody('user_password','Password is required').notEmpty();
  // req.checkBody('confirm_password','Password do not match').equals(req.body.user_password);
  //
  // req.getValidationResult().then(function(result) {
  //     if(!result.isEmpty()) {
  //        console.log("there are errors");
  //        console.log(result.isEmpty());
  //        var errors = result.mapped();
  //        res.render('register',{active_register: true, errors: errors });
  //     }
  //     else {
  //       console.log("no errors :)");
  //     }
  //  });


});

module.exports = router;
