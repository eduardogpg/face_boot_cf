var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var MongoClient = require('mongodb').MongoClient;

const PORT = 3000
const MY_SECRET_KEY = 'MY_SECRET_KEY'
const PAGE_ACCESS_TOKEN = 'EAAZALw1vqlscBAIvnudIz6lZAGDhQizpBg6ZBrCWJDYBMZCWK7PgYK2jZCrg5z5rkyPrlsqJ0wXuUx6G7KoxDrRxAad038gtDSuZAi1vI9YZBIMJNPkHXNc2WDbPe9LVaportcVTMrJRZCxVaEmlvMiAmaflAvQbHZCOHYt0XQQ9WdPKv2ZA8v2aTh'

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var server = app.listen(PORT, function(){
  console.log("El servidor se encuentra en el puerto "+ PORT);
});

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

app.post('/webhook', function (req, res) {
  var data = req.body;

  if (data.object == 'page') {
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      
      pageEntry.messaging.forEach(function(messagingEvent) {

        if(messagingEvent.message){
          receivedMessage(messagingEvent);
        }

      });
    });

    res.sendStatus(200);
  }
});

function sendWelcomeMessage(recipientId, userData){
  var message = "Hola "+ userData.first_name +" te doy la bienvenida a lo que será nuestro nuevo curso aqui en código facilito, espero que sea de tu agrado! ";
  sendTextMessage(recipientId,message);

  var message = "Si tienes alguna duda, sientete libre en enviar un coreo a eduardo@codigofacilito.com";
  sendTextMessage(recipientId, message);
}


function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var timeOfMessage = event.timestamp;
  var message = event.message;

  getUser(senderID, sendWelcomeMessage);
}


function getUser(recipientId, functionCallBack){
  request({
    uri: 'https://graph.facebook.com/v2.6/'+ recipientId,
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: 'GET'

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      data = JSON.parse(response.body);
      functionCallBack(recipientId, data)
    }
  }); 
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  callSendAPI(messageData);
}


function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
    } else {
      console.error("Unable to send message.");
    }
  });  
}

