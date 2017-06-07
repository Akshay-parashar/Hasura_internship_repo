var express = require('express');
var app = express();

var root = process.cwd();

//your routes here
app.get('/login', function (req, res) {
    res.sendFile('html/login.html' , {root});
});

app.get('/register', function (req, res) {
    res.send("Register Page");
});

app.get('/home', function (req, res) {
    res.send("Stillshare home page");
});



app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
