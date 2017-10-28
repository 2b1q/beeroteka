var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config');

var es_ping = function(){
  es_client.client.ping({
    requestTimeout: 30000,
  }, function (error) {
    if (error) {
      log.error('ES ping FAIL!\n|> ES_Index: \''+config.es.indexName+'\'');
      process.exit(0);
    } else {
      log.info('ES ping OK\n|> ES_Index: \''+config.es.indexName+'\'');
    }
  });
}

module.exports.es_ping = es_ping;
