// Attach common modules/libs
var cluster = require('cluster'),
    log = require('./libs/log')(module);

require('./models/init').es_ping();

if(cluster.isMaster) {
  require('./master');
} else {
  require('./worker');
}

// module.exports = app;
// uncaughtException handler
process.on('uncaughtException', function (err) {
    log.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    log.error(err.stack);
    process.exit(1);
});
