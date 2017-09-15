/**
ES client vendor lib
*/
var elasticsearch = require('elasticsearch'); // require ES module
// init es client
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error' // trace => dev mode
});

exports.client = client; // Export ES client
