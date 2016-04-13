var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.FBBOT_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
})

app.post('/webhook/', function (req, res) {
  console.log('req.body', req.body);
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      if (text === 'template') {
        sendTemplateMessage(sender);
      } else if (text == 'button') {
        sendButtonMessage(sender);
      } else {
        sendTextMessage(sender, text);
      }
      // Handle a text message from this sender
    } else if (event.postback) {
      sendTextMessage(sender, "You selected " + event.postback.payload);
    }
  }
  res.sendStatus(200);
});

function sendButtonMessage(sender) {
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "This is button template",
        "buttons": [
          {
            "type": "postback",
            "title": "Hello",
            "payload": "You choose Hello."
          },
          {
            "type": "postback",
            "title": "Hi",
            "payload": "You choose Hi."
          },
          {
            "type": "postback",
            "title": "こんにちは",
            "payload": "You choose こんにちは."
          },
        ]
      }
    }
  };
  sendMessage(sender, messageData);
}

function sendTemplateMessage(sender) {
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  sendMessage(sender, messageData);
}

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  sendMessage(sender, messageData);
}

function sendMessage(sender, messageData) {
  var token = process.env.FBPAGE_TOKEN;
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });  
}

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});
