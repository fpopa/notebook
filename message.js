const request = require('request');

const nbApis = require('./apis.js');
const nbAgenda = require('./agenda.js');

const callSendAPI = (messageData) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData,
  }, (err, res, body) => {
    if (!err && res.statusCode === 200) {
      console.log('Successfully sent generic message with id %s to recipient %s', body.message_id, body.recipient_id);
    } else {
      console.error('Unable to send message.');
      console.error(res);
      console.error(err);
    }
  });
};

module.exports = {
  sendTextMessage: (id, text) => {
    callSendAPI({
      recipient: {
        id,
      },
      message: {
        text,
      },
    });
  },

  receivedMessage: (event) => {
    const senderID = event.sender.id;
    let messageText = event.message.text;

    // console.log("Received message for user %d and page %d at %d with message:", senderID, event.recipient.id, event.timestamp);
    // console.log(JSON.stringify(message));

    if (!messageText) {
      return;
    }
    messageText = messageText.toLowerCase();

    switch (true) {
      case messageText === 'mmr':
        nbApis.mmr(senderID);
        break;
      case messageText.startsWith('remind me about'):
        nbAgenda.setUpReminder(senderID, messageText);
        break;
      case messageText.startsWith('weather'):
        nbApis.weather(senderID, messageText.split(' ')[1]);
        break;
      default:
        // sendTextMessage(senderID, messageText);
    }
  },
};
