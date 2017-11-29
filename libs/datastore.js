var mongoose = require('mongoose'),
    // redis = require('redis'),
    log = require('../libs/log')(module),
    config = require('../config/config');

/* Run specific mongodb
== Docker ==
docker run -d --name mongo -p 127.0.0.1:27017:27017 -p 127.0.0.1:28017:28017 -e MONGODB_USER="beeroteka" -e MONGODB_DATABASE="beeroteka" -e MONGODB_PASS="Dr1nkM0reBeeR" tutum/mongodb
docker run -d --name mongo -p 127.0.0.1:27017:27017 -p 127.0.0.1:28017:28017 -e MONGODB_PASS="Dr1nkM0reBeeR" tutum/mongodb

== HINTS ==
Mongoose (ODM - Object Data Model): Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
 sudo ssh -f -N -L 9200:localhost:9200 beeroteka (forward ES 9200 port to client host)
 sudo ssh -f -N -L 28017:127.0.0.1:28017 root@beeroteka (forward Mongo Web console to client host)
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
