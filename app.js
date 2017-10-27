// Attach common modules/libs
var cluster = require('cluster');

if(cluster.isMaster) {
  require('./master');
} else {
  require('./worker');
}

// module.exports = app;
