var express = require('express');
var app = express();

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
      sendTextMessage(sender, text);
      // Handle a text message from this sender
    }
  }
  res.sendStatus(200);
});

var token = "<page_access_token>";

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
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
