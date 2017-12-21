var credentials = require('../credentials.js'); // add credentials

var config = {};

config.server = {
  port: '3000',
  ip: (process.env.NODE_ENV == 'PROD') ? '95.213.165.61' : '127.0.0.1'
}

// cluster config
config.workers = (process.env.NODE_ENV == 'PROD') ? 4 : 2;

// cookie token
config.cookieToken = credentials.cookieToken;

// sessions
config.sessions = {
  resave: false, // Resave even no changes
  saveUninitialized: true, // Save epmpty sessions
  secret: credentials.cookieToken, // Secret string
  // store: new MongoStore({ mongooseConnection: require('mongoose').connection }) // use mongo session store
}

// redis config
config.store = {
  redis: {
    port : 6379,
    host : '127.0.0.1'
  },
  mongo: {
    uri: 'mongodb://beeroteka:Dr1nkM0reBeeR@127.0.0.1:27017/beeroteka',
    options: {
      useMongoClient: true,
      autoIndex: process.env.NODE_ENV !== 'PROD', // Don't build indexes in PROD
      poolSize: 2 // количество подключений в пуле
    }
  }
}

// elasticsearch config
config.es = {
  promiseDelay: 200,
  apivoFetchSize: 1610, // default 1700
  index: {
    ba: 'ba1',
    apivo: 'apivo',
    all: 'resultdb3'
  },
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
