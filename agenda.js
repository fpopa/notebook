const Agenda = require('agenda');

const nbMessage = require('./message.js');

let agenda;

const defineCommands = () => {
  agenda.define('sendReminder', (job) => {
    console.log(`sending scheduled message to ${job.attrs.data.senderID}`);

    nbMessage.sendTextMessage([job.attrs.data.senderID], `Hello :), reminding you about \n\n ${job.attrs.data.text}`);
  });
};

const init = (address = 'mongodb://127.0.0.1/agenda') => {
  agenda = new Agenda({ db: { address } });

  agenda.on('ready', () => {
    console.log('ready for scheduling messages');

    agenda.start();
    defineCommands(agenda);
  });
};

const setUpReminder = (senderID, messageText) => {
  const splitMessageText = messageText.split('!reminder ');
  const errMessage = 'Sorry, something went wrong, here\'s an example: \n\n !reminder you\'re awesome in 10 seconds';

  if (splitMessageText.length !== 2) {
    nbMessage.sendTextMessage([senderID], errMessage);
    return;
  }

  if (splitMessageText[1].split(' in ').length !== 2) {
    nbMessage.sendTextMessage([senderID], errMessage);
    return;
  }

  const [text, time] = splitMessageText[1].split(' in ');

  nbMessage.sendTextMessage([senderID], 'Reminder set. (Y)');

  console.log(`scheduling message for ${senderID}`);
  agenda.schedule(`in ${time}`, 'sendReminder', { senderID, text });
};

module.exports.init = init;
module.exports.setUpReminder = setUpReminder;
