var mongoose = require('mongoose'),
    redis = require('redis'),
    log = require('../libs/log')(module),
    config = require('../config/config');

/* Run specific mongodb
docker run -d --name mongo -p 127.0.0.1:27017:27017 -p 127.0.0.1:28017:28017 -e MONGODB_USER="beeroteka" -e MONGODB_DATABASE="beeroteka" -e MONGODB_PASS="Dr1nkM0reBeeR" tutum/mongodb
*/
