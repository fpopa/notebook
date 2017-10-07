const nbDatabase = require('./database.js');
const nbMessage = require('./message.js');

let Users = null;

const ensureCollectionExists = (collection) => {
  if (!Users) {
    Users = nbDatabase.getCollection(collection);
  }
};

const ensureUserExists = (senderID) => {
  ensureCollectionExists('users');

  Users.update({
    senderID,
  }, {
    $setOnInsert: {
      senderID,
      ubb_updates: false,
    },
  }, {
    upsert: true,
  });
};

const toggleUbbUpdates = (senderID) => {
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
        ubb_updates: !user.ubb_updates,
      },
    }, (updateErr) => {
      // todo make a function that hanles all these stupid errors.
      if (updateErr) {
        console.log('something went wrong with the database ', updateErr);
      }

      let updatesStatus = 'enabled';
      // we do it like so because we check the value before update.
      if (user.ubb_updates === true) {
        updatesStatus = 'disabled';
      }

      nbMessage.sendTextMessage([senderID], `Ubb updates are now ${updatesStatus}`);
    });
  });
};

module.exports.toggleUbbUpdates = toggleUbbUpdates;
module.exports.ensureUserExists = ensureUserExists;
