var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

const PORT = 3000
const MY_SECRET_KEY = 'MY_SECRET_KEY'

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || PORT));

app.get('/', function (req, res) {
    res.send('This is a project for my own Facebook bot');
});


app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === MY_SECRET_KEY) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});