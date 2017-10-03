const Agenda = require('agenda');

const nbMessage = require('./message.js');

let agenda;

const defineCommands = () => {
  agenda.define('sendReminder', (job) => {
    console.log(`sending scheduled message to ${job.attrs.data.senderID}`);

    nbMessage.sendTextMessage(job.attrs.data.senderID, `Hello :), reminding you about \n\n ${job.attrs.data.text}`);
  });
};

module.exports = {
  init: (address = 'mongodb://127.0.0.1/agenda') => {
    agenda = new Agenda({ db: { address } });

    agenda.on('ready', () => {
      console.log('ready for scheduling messages');
      agenda.start();
      defineCommands(agenda);
    });
  },

  setUpReminder: (senderID, messageText) => {
    const [text, time] = messageText.split('about')[1].split(' in ');

    console.log(`scheduling message for ${senderID}`);
    agenda.schedule(`in ${time}`, 'sendReminder', { senderID, text });
  },
};
