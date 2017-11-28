var mongoose = require('mongoose'),
    // redis = require('redis'),
    log = require('../libs/log')(module),
    config = require('../config/config');

/* Run specific mongodb
== Docker ==
docker run -d --name mongo -p 127.0.0.1:27017:27017 -p 127.0.0.1:28017:28017 -e MONGODB_USER="beeroteka" -e MONGODB_DATABASE="beeroteka" -e MONGODB_PASS="Dr1nkM0reBeeR" tutum/mongodb

== HINTS ==
Mongoose (ODM - Object Data Model): Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
*/

var initMongo = function(){
  mongoose.connect(config.store.mongo.uri, config.store.mongo.options);
  let db = mongoose.connection;

  // generate msg on error
  return db.on('error',() => false );
  // if connection to MongoDB is success
  return db.once('open',() => true );
}

module.exports = {
  initMongo: initMongo
}
