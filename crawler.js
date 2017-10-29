const cheerio = require('cheerio');
const request = require('request');

const nbDatabase = require('./database.js');
const nbMessage = require('./message.js');

const findings = [];

const notify = (message) => {
  nbDatabase.getCollection('users').find({
    notifications: true,
  }).toArray((err, users) => {
    const ids = users.map(user => user.senderID);

    nbMessage.sendTextMessage(ids, message);
  });
};

const crawl = ({ url, selector, init = false }) => {
  request.get(url, (error, response, body) => {
    if (error) {
      console.log(`${Date()}: Crawler Error: ${error}`);

      setTimeout(() => { crawl({url, selector, init}); }, 5 * 60 * 1000);
      return;
    }

    const $ = cheerio.load(body);
    const lastFindings = [];

    $(selector).each(function () {
      lastFindings.push(`${$(this).attr('href')}\n${$(this).text()}`);
    });

    lastFindings.forEach((finding) => {
      if (findings.includes(finding)) {
        return;
      }

      findings.push(finding);
      if (init === true) {
        return;
      }

      notify(`DBG: ${findings.length}, anunt nou: ${finding}`);

      if (findings.length > 20) {
        findings.shift();
      }
    });

    setTimeout(() => { crawl({ url, selector }); }, 10 * 60 * 1000);
  });
};

const saveSelector = ({ _id, selector }) => {
  nbDatabase.getCollection('crawlers').update({
    _id,
  }, {
    $set: {
      selector,
    },
  });
};

const createSelectorAndCrawl = ({ url, example, _id }) => {
  request.get(url, (error, response, body) => {
    if (error) {
      console.log(`${Date()}: Fetching page failed.`);
      return;
    }

    const $ = cheerio.load(body);
    const content = $.html();
    const index = content.indexOf(example);
    const zone = content.substring(index - 200, index);
    const element = zone.split('<').pop().split(' ')[0];
    const exampleSelector = `${element}:contains('${example}')`;

    let node = $(exampleSelector).get(0);
    const parentElements = [];

    while (node.parent) {
      parentElements.push(node.name);

      node = node.parent;
    }

    parentElements.push(node.name);

    const selector = parentElements.reverse().join(' ');
    saveSelector({ _id, selector });

    crawl({
      url,
      selector,
      init: true,
    });
  });
};

const startCrawlers = () => {
  nbDatabase.getCollection('crawlers').find({
  }).toArray((err, crawlers) => {
    crawlers.forEach((crawler) => {
      if (!crawler.selector) {
        createSelectorAndCrawl(crawler);
        return;
      }

      crawl({
        url: crawler.url,
        selector: crawler.selector,
        init: true,
      });
    });
  });
};

module.exports.startCrawlers = startCrawlers;
