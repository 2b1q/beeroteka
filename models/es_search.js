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
      let beer = result1data[i]._source.beer;
      let brewary = result1data[i]._source.brewary;
      // log.info('Search query 2. Beer %s. Brewary %s', beer, brewary)
      let query_object = {
        beer: beer,
        brewary: brewary
      }
      es_client.client.search(query.search(query_object, 'ap_bool'))
        .then(function (resp) {
          if( resp.hits.hits.length > 0 ){
            log.info(config.color.yellow+'QUERY 2 Hits count: '+config.color.white+resp.hits.hits.length)
            log.info('query 2 result: \n'+JSON.stringify(resp.hits.hits, null, 2));
            resolve(resp.hits.hits); // resolve OCCURED Only ONCE
          } else {
            resolve(result1data)
          }
        }, function (err) {
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
          if( result1.length === 0 ) callback(result1)
          else {
            // log.info('query 1 result: \n'+JSON.stringify(result1, null, 2));;
            resolve(result1)
          }
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



// ES bool search with callback
// module.exports.search = function(searchData, callback) {
//   es_client.client.search(query.search(searchData, 'ba_multi_match')).then(function (resp) {
//     log.info('Hits count %d', resp.hits.hits.length)
//     callback(resp.hits.hits);
//   }, function (err) {
//     callback(err.message) // return err.stack
//     log.error(err.message);
//   });
// }

 module.exports.search = query1;
