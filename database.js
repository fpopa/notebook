const { MongoClient } = require('mongodb');

let con = null;

const connect = (url, cb) => {
  if (con) {
    return cb();
  }

  MongoClient.connect(url, (err, c) => {
    if (err) {
      return cb(err);
    }

    con = c;
    return cb();
  });
};

const getCollection = collection => con.collection(collection);

module.exports.connect = connect;
module.exports.getCollection = getCollection;
