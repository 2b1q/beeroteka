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
};

// ES bool search with callback
module.exports.search = function(searchData, callback) {
  es_client.client.search(setupQuery(searchData, 'multi_match_analyzer')).then(function (resp) {
    // console.log('ES data: \n'+resp.hits.hits[0]._source.result);
    console.log('ES data: \n'+JSON.stringify(resp.hits.hits, null, 2));
    callback(resp.hits.hits);
  }, function (err) {
      callback(err.message)
      console.log(err.message);
  });
}
