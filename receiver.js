require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');

const nbAgenda = require('./agenda.js');
const nbCrawler = require('./crawler.js');
const nbDatabase = require('./database.js');
const nbMessage = require('./message.js');
const nbTexts = require('./texts.js');

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

app.get('/privacy', (req, res) => {
  res.send(nbTexts.privacy());
});

app.get('/dev/:message', (req, res) => {
  if (process.env.ENV !== 'dev') {
    res.sendStatus(405);
    return;
  }

  console.log(req.params.message);

  nbMessage.receivedMessage({
    message: {
      text: req.params.message,
    },
      sender: {
        id: 'dev_id',
    },
  });

  res.send(`received: ${req.params.message}`);
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

nbDatabase.connect('mongodb://localhost:27017/notebook', (err) => {
  if (err) {
    console.log('Unable to connect to mognodb.');
    process.exit(1);
  }

  nbAgenda.init();

  nbCrawler.startCrawlers();

  app.listen(3005);
});


// TODO http://www.cs.ubbcluj.ro/robots.txt

// when using any spiderino check for /robots.txt to see if the website is friend or foe
