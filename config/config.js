var credentials = require('../credentials.js'); // add credentials
var config = {};

config.server = {
  port: '3000',
  ip: 'localhost'
}

// cluster config
config.workers = 4;

// cookie token
config.cookieToken = credentials.cookieToken;

// sessions
config.sessions = {
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieToken
}

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

// colorize console
config.color = {
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  white: "\x1b[37m"
}

module.exports = config;
