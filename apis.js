const request = require('request');
const moment = require('moment');

const nbMessage = require('./message.js');

const mmr = (senderID) => {
  const url = 'https://api.opendota.com/api/players/58161269';

  request.get(url, (err, res, body) => {
    const response = JSON.parse(body);

    nbMessage.sendTextMessage(senderID, response.mmr_estimate.estimate);
  });
};

const weather = (senderID, city = 'Cluj-Napoca') => {
  const url = `http://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${process.env.WEATHER_APP_ID}`;
  request.get(url, (err, res, body) => {
    const response = JSON.parse(body);

    let responseMessage = '';

    const sunrise = moment.unix(response.sys.sunrise).format('HH:mm:ss');
    const sunset = moment.unix(response.sys.sunset).format('HH:mm:ss');

    responseMessage += `${response.sys.country} - ${response.name}.\n`;
    responseMessage += `sunrise: ${sunrise}.\n`;
    responseMessage += `sunset:  ${sunset}.\n`;
    responseMessage += `${response.weather[0].main}.\n`;
    responseMessage += `${response.weather[0].description}.\n`;
    responseMessage += `${response.main.temp}°.\n`;
    responseMessage += `${response.main.humidity}% humidity.\n`;
    responseMessage += `${response.clouds.all}% clouds.\n`;

    nbMessage.sendTextMessage(senderID, responseMessage);
  });
};

module.exports.mmr = mmr;
module.exports.weather = weather;
