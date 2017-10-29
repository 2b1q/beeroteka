var cluster = require('cluster'),
    config = require('./config/config'),
    log = require('./libs/log')(module);

// if worker 'disconnect' from IPC channel
cluster.on('disconnect', (worker, code, signal) => {
    log.error('Worker %d died', worker.id)
    cluster.fork();
});

cluster.on('online', (worker) => {
    log.info(config.color.magenta+'Worker %d '+config.color.white+'online', worker.id)
});

// fork workers process (not by CPU cores)
for(var i = 0; i < config.workers; ++i) {
  cluster.fork();
}
