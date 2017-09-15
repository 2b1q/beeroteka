/**
ES ping model
*/
var es_client = require('../lib/elasticsearch'); // require ES module

var model = '[ES ping model] ';

// Ping elasticsearch on module init
function es_ping(project, indexName) {
  return es_client.client.ping({
    requestTimeout: 30000,
  }, function (error) {
    if (error) {
      console.log(model+'is FAIL!\n|> Project: \''+project+'\'\n|> ES_Index: \''+indexName+'\'');
    } else {
      console.log(model+'is OK\n|> Project: \''+project+'\'\n|> ES_Index: \''+indexName+'\'');
    }
  });
}

exports.es_ping = es_ping; // export es_ping()
