require('dotenv').config()
const Agenda = require('agenda');
const app = express();
const bodyParser = require('body-parser');
const express = require('express');
const moment = require('moment');
const request = require('request');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

app.get('/test', function (req, res) {
    res.send('well done');
});

app.post('/webhook', function (req, res) {
  if (! req.body.object === 'page') {
    return;
  }

  // Iterate over each entry - there may be multiple if batched
  req.body.entry.forEach(entry => {
    entry.messaging.forEach(event => {
      if ( ! event.message) {
        console.log("Webhook received unknown event: ", event);

        return;
      }
      receivedMessage(event);
    });
  });

  res.sendStatus(200);
});


const receivedMessage = (event) => {
  const senderID = event.sender.id;
  let messageText = event.message.text;

  // console.log("Received message for user %d and page %d at %d with message:", senderID, event.recipient.id, event.timestamp);
  // console.log(JSON.stringify(message));

  if (! messageText) {
    return;
  }
  messageText = messageText.toLowerCase();

  switch (true) {
    case 'mmr' === messageText:
        mmr(senderID);
      break;
    case messageText.startsWith('remind me about'):
        setUpReminder(senderID, messageText);
    case messageText.startsWith('weather'):
        weather(senderID, messageText.split(' ')[1]);
      break;
    default:
      // sendTextMessage(senderID, messageText);
  }
}

const mmr = (senderID) => {
  const url = 'https://api.opendota.com/api/players/58161269';

  request.get(url, (err, res, body) => {
      response = JSON.parse(body);

      sendTextMessage(senderID, response.mmr_estimate.estimate);
  });
}

const weather = (senderID, city = 'Cluj-Napoca') => {
  const url = `http://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${process.env.WEATHER_APP_ID}`;
  request.get(url, (err, res, body) => {
    response = JSON.parse(body);

    let responseMessage = '';

    const sunrise = moment.unix(response.sys.sunrise).format('HH:mm:ss')
    const sunset = moment.unix(response.sys.sunset).format('HH:mm:ss')

    responseMessage += `${response.sys.country} - ${response.name}.\n`;
    responseMessage += `sunrise: ${sunrise}.\n`;
    responseMessage += `sunset:  ${sunset}.\n`;
    responseMessage += `${response.weather[0].main}.\n`;
    responseMessage += `${response.weather[0].description}.\n`;
    responseMessage += `${response.main.temp}°.\n`;
    responseMessage += `${response.main.humidity}% humidity.\n`;
    responseMessage += `${response.clouds.all}% clouds.\n`;

    sendTextMessage(senderID, responseMessage);
  });
}

const sendTextMessage = (recipientId, messageText) => {
  callSendAPI({
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
    }
  });
}

const callSendAPI = (messageData) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData,
  }, (err, res, body) => {
    if (! err && res.statusCode === 200) {
      console.log("Successfully sent generic message with id %s to recipient %s", body.message_id, body.recipient_id);
    } else {
      console.error("Unable to send message.");
      console.error(res);
      console.error(err);
    }
  });
}

app.listen(3005)

const agenda = new Agenda({db: {address: 'mongodb://127.0.0.1/agenda'}});

agenda.define('sendReminder', function(job, done, data) {
  sendTextMessage(job.attrs.senderID, `Hello :), reminding you about \n\n ${job.attrs.text}`)
});

const setUpReminder = (senderID, messageText) => {
  const [text, time] = messageText.split('about')[1].split(' in ');

  agenda.on('ready', function() {
    agenda.schedule(`in ${time}`, 'sendReminder', {senderID, text});
    agenda.start();
  });
}
