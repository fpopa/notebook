const nbApis = require('./apis.js');
const nbDatabase = require('./database.js');
const nbMessage = require('./message.js');

let Users = null;

const ensureCollectionExists = (collection) => {
  if (!Users) {
    Users = nbDatabase.getCollection(collection);
  }
};

const welcomeNewUser = (senderID, user) => {
  nbMessage.sendTextMessage([senderID], `Hello ${user.first_name} :)\n\n I am here to help you, see how by writting '!help'`);
};

const saveExtraData = (senderID, user) => {
  Users.update({
    senderID,
  }, {
    $set: {
      first_name: user.first_name,
      last_name: user.last_name,
    },
  });
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
      nbApis.userData(senderID, (userData) => {
        saveExtraData(senderID, userData);
        welcomeNewUser(senderID, userData);
      });
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
