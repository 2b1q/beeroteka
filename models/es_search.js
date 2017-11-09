/**
ES Search model
*/
var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    query = require('./dsl');

function query2(result1data){
  return new Promise(function(resolve, reject){
    result1data.forEach(function(item, i, result1data){
      let query_object = {
        beer: item._source.beer,
        brewary: item._source.brewary
      }
      es_client.client.search(query.search(query_object, 'ap_bool'))
        .then(function(resp){
          // IF Query2 clauses have HITS then render this OBJ
          if( resp.hits.hits.length > 0 ) resolve(resp.hits.hits); // resolve Event OCCURED Only ONCE (means other ForEach resolve`s will be ignored )
          else resolve(result1data)
        }, function(err){
            reject(err.message) // return err.stack
        });
      })
  })
}

var query1 = function(searchTxt1, callback){
  new Promise(function(resolve, reject){
    es_client.client.search(query.search(searchTxt1, 'ba_simple_query_string'))
      .then(function(resp) {
          var result1 = resp.hits.hits;
          log.info(config.color.yellow+'QUERY 1 Hits count: '+config.color.white+result1.length)
          if( result1.length === 0 ) callback(result1) // IF first Query (BA) has no HITS return callback
          else resolve(result1)
      }, function (err) {
          reject(err.message) // return err.stack
      });
  })
  .then(query2)
  .then(callback)
  .catch(error => {
    log.error(error)
    callback(err.message)
  })
}

 module.exports.search = query1;
