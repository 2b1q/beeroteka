/**
ES Search model
*/
var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    query = require('./dsl');

var res1, res2; // result data1 and data2

function query2(result1data){
  var res1 = result1data;
  return new Promise(function(resolve, reject){
    result1data.forEach(function(item){
      let query_object = {
        beer: item._source.beer,
        brewary: item._source.brewary
      }
      es_client.client.search(query.search(query_object, 'bool_query_string'))
        .then(function(resp){
          // IF Query2 clauses have HITS then render this OBJ
          if( resp.hits.hits.length > 0 ) {
            log.info(config.color.yellow+'QUERY 2 Hits count: '+config.color.white+resp.hits.hits.length)
            // console.log(JSON.stringify(resp.hits.hits, null, 2));
            res2 = resp.hits.hits;
            resolve(resp.hits.hits); // resolve Event OCCURED Only ONCE (means other ForEach resolve`s will be ignored )
          }
           else resolve([]) // resolve empty list
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
