var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    datastore = require('../libs/datastore'), // require datastore
    apivoModel = require('./apivoModel'), // Apivo schema model
    baModel = require('./baModel'), // Ba schema model
    config = require('../config/config');

var status = {
  es_fail: ()=> {log.error(`${config.color.yellow}ES ping ${config.color.white} FAIL!`)},
  es_ok: ()=> {log.info(`${config.color.yellow}ES ping ${config.color.white} OK`)},
  mongo_ok: ()=> {log.info(`${config.color.yellow}MongoDB INIT ${config.color.white} OK`)},
  mongo_fail: ()=> {log.info(`${config.color.yellow}MongoDB INIT ${config.color.white} FAIL`)},
}

// MongoDB init Promise
function initMongo(){
  return new Promise(function(resolve, reject){
    if(datastore.initMongo()) resolve(status.mongo_ok())
    else reject(status.mongo_fail())
  })
}

function countMongoDocs() {
  apivoModel.count({}, function (err, cnt) {
    log.info(`${config.color.white}apivoModel docs total: ${config.color.yellow}${cnt}`);
  });
  baModel.count({}, function (err, cnt) {
    log.info(`${config.color.white}baModel docs total: ${config.color.yellow}${cnt}`);
  })
}

// Promise _ping ES (if 'err' => process.exit(0))
var BackendInit = function(){
  new Promise(function(resolve, reject){
    es_client.client.ping({requestTimeout: 30000},
      function(err) {
        if(err) reject(status.es_fail())
        else resolve(status.es_ok())
      })
  })
  .then(initMongo)
  .then(countMongoDocs)
  .catch(error => {
      log.error(error)
      process.exit(0)
    })
}

module.exports.BackendInit = BackendInit;
