/**
apivo to ES connector
*/
var elastic_ping = require('./es_ping'), // require ES ping
    // project = 'APIVO.RU',  // set project
    indexName = "resultdb3"; // setup ES index

function esping() {
  elastic_ping.es_ping(indexName); // try PING apivo index
}

exports.ping = esping; // export es_ping()
exports.indexName = indexName;
