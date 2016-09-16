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

app.post('/webhook', function (req, res) {
  var data = req.body;

  if (data.object == 'page') {
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      
      pageEntry.messaging.forEach(function(messagingEvent) {
      	if (messagingEvent.message) {
      		receivedMessage(messagingEvent);
        } 
      });
    });

    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
  	sendTextMessage(senderID, "Message with attachment received");
  }
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
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
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

