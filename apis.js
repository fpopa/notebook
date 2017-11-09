const request = require('request');
const moment = require('moment');

const nbMessage = require('./message.js');

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

    nbMessage.sendTextMessage([senderID], responseMessage);
  });
};

const userData = (senderID, cb) => {
  const url = `https://graph.facebook.com/${senderID}?fields=first_name,last_name,profile_pic&access_token=${process.env.PAGE_ACCESS_TOKEN}`;

  request.get(url, (err, res, body) => cb(JSON.parse(body)));
};

module.exports.weather = weather;
module.exports.userData = userData;
