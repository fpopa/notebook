require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');

const nbMessage = require('./message.js');
const nbAgenda = require('./agenda.js');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

app.get('/test', (req, res) => {
  res.send('well done');
});

app.post('/webhook', (req, res) => {
  if (!req.body.object === 'page') {
    return;
  }

  // Iterate over each entry - there may be multiple if batched
  req.body.entry.forEach((entry) => {
    entry.messaging.forEach((event) => {
      if (!event.message) {
        console.log('Webhook received unknown event: ', event);

        return;
      }
      nbMessage.receivedMessage(event);
    });
  });

  res.sendStatus(200);
});

nbAgenda.init();

app.listen(3005);
