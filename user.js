const nbDatabase = require('./database.js');
const nbMessage = require('./message.js');

let Users = null;

const ensureCollectionExists = (collection) => {
  if (!Users) {
    Users = nbDatabase.getCollection(collection);
  }
};

const welcomeNewUser = (senderID) => {
  nbMessage.sendTextMessage([senderID], 'Hello :)\n\n I am here to help you, see how by writting \'!help\'');
};

const ensureUserExists = (senderID) => {
  ensureCollectionExists('users');

  Users.update({
    senderID,
  }, {
    $setOnInsert: {
      senderID,
      notifications: false,
    },
  }, {
    upsert: true,
  }, (err, command) => {
    if (err) {
      console.log('something went wrong with the database ', err);
    }

    if (command.result.upserted) {
      welcomeNewUser(senderID);
    }
  });
};

const toggleNofitications = (senderID) => {
  ensureCollectionExists('users');

  Users.findOne({
    senderID,
  }, (err, user) => {
    // todo make a function that hanles all these stupid errors.
    if (err) {
      console.log('something went wrong with the database ', err);
    }

    Users.update({
      senderID,
    }, {
      $set: {
        notifications: !user.notifications,
      },
    }, (updateErr) => {
      // todo make a function that hanles all these stupid errors.
      if (updateErr) {
        console.log('something went wrong with the database ', updateErr);
      }

      let updatesStatus = 'enabled';
      // we do it like so because we check the value before update.
      if (user.notifications === true) {
        updatesStatus = 'disabled';
      }

      nbMessage.sendTextMessage([senderID], `Notifications are now ${updatesStatus}`);
    });
  });
};

module.exports.toggleNofitications = toggleNofitications;
module.exports.ensureUserExists = ensureUserExists;
