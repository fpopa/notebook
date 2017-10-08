const cheerio = require('cheerio');
const request = require('request');

const nbDatabase = require('./database.js');
const nbMessage = require('./message.js');

const announcements = [];

const notify = (message) => {
  nbDatabase.getCollection('users').find({
    ubb_updates: true,
  }).toArray((err, users) => {
    const ids = users.map(user => user.senderID);
    nbMessage.sendTextMessage([ids], message);
  });
};

const fetch = (init = false) => {
  const url = 'http://www.cs.ubbcluj.ro/';
  // const url = `http://www.cs.ubbcluj.ro/anunturi/anunturi-studenti/anunturi-cazare/`;

  request.get(url, (error, response, body) => {
    if (error) {
      console.log('CRAWLER ERROR :', error);

      setTimeout(() => { fetch(); }, 3 * 1000);
      return;
    }

    const $ = cheerio.load(body);

    const lastAnnouncements = [];

    // $('.category-anunturi-cazare h2.title a').each(function(i) {
    $('h2.title a').each(function () {
      lastAnnouncements.push(`${$(this).attr('href')}\n${$(this).text()}`);
    });

    lastAnnouncements.forEach((title) => {
      if (announcements.includes(title)) {
        return;
      }

      announcements.push(title);
      if (init === true) {
        return;
      }

      notify(`DBG: ${announcements.length}, anunt nou: ${title}`);

      if (announcements.length > 20) {
        announcements.shift();
      }
    });

    setTimeout(() => { fetch(); }, 3 * 1000);
  });
};


module.exports.fetch = fetch;
