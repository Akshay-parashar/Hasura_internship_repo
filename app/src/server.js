var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var hbs = require('hbs');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
hbs.localsAsTemplateData(app);


// App locals
app.locals.sitename = "StillShare";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/', index);
app.use('/users', users);

//var root = process.cwd();

//your routes here
// app.get('/login', function (req, res) {
//     res.sendFile('html/login.html' , {root});
// });
//
// app.get('/register', function (req, res) {
//     res.send("Register Page");
// });
//
// app.get('/home', function (req, res) {
//     res.send("Stillshare home page");
// });



app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
