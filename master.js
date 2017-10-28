var cluster = require('cluster'),
    config = require('./config/config'),
    log = require('./libs/log')(module);

// var CPUCount = require("os").cpus().length;
// Создание дочернего процесса требует много ресурсов. Поэтому в связке с 8 ядерным сервером и Nodemon-ом дает адские лаги при сохранении.
// Рекомендую при активной разработке ставить CPUCount в 1 иначе вы будете страдать как я....

cluster.on('disconnect', (worker, code, signal) => {
    // В случае отключения IPC запустить нового рабочего (мы узнаем про это подробнее далее)
    log.error('Worker %d died', worker.id)
    cluster.fork();
});

cluster.on('online', (worker) => {
    log.info('Worker %d online', worker.id)
});

// fork workers process
for(var i = 0; i < config.workers; ++i) {
  cluster.fork();
}
