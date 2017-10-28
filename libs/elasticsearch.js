/**
ES client vendor lib
*/
var elasticsearch = require('elasticsearch'), // require ES module
    config = require('../config/config');
// init es client
var client = new elasticsearch.Client({
  host: config.es.host,
  log: config.es.log
});

exports.client = client; // Export ES client
