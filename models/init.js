var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config');

// ping ES (if 'err' => process.exit(0))
var es_ping = function(){
  es_client.client.ping({
    requestTimeout: 30000,
  }, function (error) {
    if (error) {
      log.error(config.color.yellow+'ES ping Index '+config.color.white+'"%s"'
                +config.color.red+'FAIL!', config.es.indexName);
      process.exit(0);
    } else {
      log.info(config.color.yellow+'ES ping Index '+config.color.white+'"%s"'
                +config.color.magenta+' OK', config.es.indexName);
    }
  });
}

module.exports.es_ping = es_ping;
