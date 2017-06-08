var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Hello User, welcome to user_home page");
});

router.get('/dashboard', function(req, res, next) {
  res.send("Hello User, this your personal dashboard");
});

module.exports = router;
