var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config');

var status = {
  fail: ()=> {log.error(`${config.color.yellow} ES ping ${config.color.white} FAIL!`)},
  ok: ()=> {log.info(`${config.color.yellow} ES ping ${config.color.white} OK`)}
}

// Promise _ping ES (if 'err' => process.exit(0))
var es_ping = function(){
  new Promise(function(resolve, reject){
    es_client.client.ping({requestTimeout: 30000},
      function(err) {
        if(err) reject(status.fail())
        else resolve(status.ok())
      })
  }).catch(error => {
      log.error(error)
      process.exit(0)
    })
}

module.exports.es_ping = es_ping;
