/**
ES Search model
*/
var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    query = require('./dsl');

/*
var indexName = config.es.indexName;

// Search behavior
var pageNum = 1, perPage = 10; // default

function setupQuery(searchData, queryType) {
  console.log('Query type: '+queryType);
  console.log('searchData params: '+JSON.stringify(searchData, null, 2));
  switch (queryType) {
    //The multi_match query builds on the match query to allow multi-field queries
    case 'multi_match_analyzer':
      return {
        index: indexName,
        body: {
            'query': {
              'multi_match' : {
                'query':    searchData,
                'analyzer': 'custom_lowercase_stemmed',
                'fields': [ 'beer', 'title', 'Бренд', 'Название' ]
              }
            }
          }
        };
      break;
      case 'nasted':
        return {
              index: indexName,
              body: {
                "query": {
                  "nested" : {
                      "path" : "apivo",
                      // "score_mode" : "avg",
                      "query" : {
                          "bool" : {
                              "must" : [

                                  { "match" : {"apivo.Название" : searchData} },
                                  // { "range" : {"obj1.count" : {"gt" : 5}} }
                              ]
                          }
                      }
                  }
              }
          }
        };
      break;
    case 'bool':
      return {
        index: indexName,
        type: 'beeradvocate',
        // type: 'apivo',
        body: {
          query: {
            bool: {
              must:     { match: { 'title': searchData }},
              // must_not: { match: { '_type': '_type'  }},
              should:
                [
                  {
                    'script':
                      { "script": "doc['beer'].value ==~  /doc['Название'].value/" }
                  }
                ]
            }
          }
          // "filter": {
          //   "script": {
          //     "script": "doc['originRegion'].value ==  doc['destinationRegion'].value"
          //   }
          // }
        }
      };
    default:
    // TODO Set default query type
    return {
      index: indexName,
      from: (pageNum - 1) * perPage, // 10 - perPage
      size: perPage, // 10 - perPage
      body: {
        query: {
          match: {
            result: searchData
          }
        }
      }
    };
  }
}; */

function query2(result1data){
  return new Promise(function(resolve, reject){
    result1data.forEach(function(item, i, result1data){
      let beer = result1data[i]._source.beer;
      log.info('Search query 2. Beer %s', beer)
      es_client.client.search(query.search(beer, 'match'))
        .then(function (resp) {
            log.info('Query 2 Hits count %d', resp.hits.hits.length)
            resolve(resp.hits.hits);
        }, function (err) {
            reject(err.message) // return err.stack
        });
      })
  })
}

var query1 = function(searchTxt1, callback){
  new Promise(function(resolve, reject){
    es_client.client.search(query.search(searchTxt1, 'ba_multi_match'))
      .then(function(resp) {
          var result1 = resp.hits.hits;
          log.info('Hits count %d', result1.length)
          if( result1.length === 0 ) callback(result1)
          else {
            log.info('query 1 result: \n'+JSON.stringify(result1, null, 2));;
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
