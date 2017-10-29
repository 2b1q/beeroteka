var cluster = require('cluster'),
    log = require('./libs/log')(module);

// init connect to ES (if ES ping 'false' => process.exit(0))
require('./models/init').es_ping();

if(cluster.isMaster) require('./master')
else require('./worker')

// uncaughtException handler
process.on('uncaughtException', function (err) {
    log.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    log.error(err.stack);
    process.exit(1);
});
