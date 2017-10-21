const request = require('request');

const nbApis = require('./apis.js');
const nbAgenda = require('./agenda.js');
const nbUser = require('./user.js');
const nbHelp = require('./help.js');

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
      console.error(res.body);
    }
  });
};

const sendTextMessage = (ids, text) => {
  ids.forEach((id) => {
    callSendAPI({
      recipient: {
        id,
      },
      message: {
        text,
      },
    });
  });
};

const receivedMessage = (event) => {
  const senderID = event.sender.id;
  let messageText = event.message.text;

  // console.log("Received message for user %d and page %d at %d with message:",
  // senderID, event.recipient.id, event.timestamp);
  // console.log(JSON.stringify(message));

  if (!messageText) {
    return;
  }

  nbUser.ensureUserExists(senderID);
  messageText = messageText.toLowerCase();

  switch (true) {
    case messageText.startsWith('!help'):
      sendTextMessage([senderID], nbHelp.commands());
      break;
    case messageText === '!mmr':
      nbApis.mmr(senderID);
      break;
    case messageText.startsWith('!reminder'):
      nbAgenda.setUpReminder(senderID, messageText);
      break;
    case messageText.startsWith('!weather'):
      nbApis.weather(senderID, messageText.split(' ')[1]);
      break;
    case messageText.startsWith('!togglenotifications'):
      sendTextMessage([senderID], 'notifications are currently disabled');
      // nbUser.toggleNofitications(senderID);
      break;
    default:
      // sendTextMessage(senderID, messageText);
  }
};

module.exports.sendTextMessage = sendTextMessage;
module.exports.receivedMessage = receivedMessage;
