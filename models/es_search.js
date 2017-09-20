/**
ES Search model
*/
var es_client = require('../lib/elasticsearch'); // require ES module
var indexName = require('./apivo_es').indexName; // add index

// Search behavior
var pageNum = 1, perPage = 10; // default

function setupQuery(searchData, queryType) {
  console.log('Query type: '+queryType);
  console.log('searchData params: '+JSON.stringify(searchData, null, 2));
  switch (queryType) {
    //The multi_match query builds on the match query to allow multi-field queries
    case 'multi_match':
      return {
        index: indexName,
        // type: 'apivo',
        body: {
            'query': {
              'multi_match' : {
                'query':    searchData,
                // 'fields': [ 'result' ]
                'fields': [ 'beer', 'title', 'Бренд', 'Название' ]
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
              must: {
                match: {
                  // 'result': searchData.searchTerm
                  // 'result': searchData
                  'title': searchData
                }
              }
            }
          }
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
};

// ES bool search with callback
module.exports.search = function(searchData, callback) {
  es_client.client.search(setupQuery(searchData, 'multi_match')).then(function (resp) {
    // console.log('ES data: \n'+resp.hits.hits[0]._source.result);
    console.log('ES data: \n'+JSON.stringify(resp.hits.hits, null, 2));
    callback(resp.hits.hits);
  }, function (err) {
      callback(err.message)
      console.log(err.message);
  });
}
