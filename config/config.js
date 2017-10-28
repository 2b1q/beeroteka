var config = {};

config.server = {
  port: '3000',
  ip: 'localhost'
}

// cluster config
config.workers = 4;

// redis config
config.store = {
  redis: {
    port : 6379,
    host : '127.0.0.1'
  }
}

// elasticsearch config
config.es = {
  indexName: 'resultdb3',
  host: 'localhost:9200',
  log: 'error' // trace => dev mode
}

config.color = {
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m"
}

module.exports = config;
