var config = require('../config/config'),
    indexName = config.es.indexName; // ES Index name

// common ES query function
var query = function(searchData, queryType){
  console.log('Query type: '+queryType);
  console.log('searchData params: '+JSON.stringify(searchData, null, 2));
  switch (queryType) {
    case 'multi_match':
      return multi_match(searchData);
    break;
    case 'nasted':
      return nasted(searchData);
    break;
  }
}

// multi_match query
var multi_match = (searchData) => {
  return {
    index: indexName,
    body: {
        'query': {
          'multi_match' : {
            'query':  searchData,
            'analyzer': 'custom_lowercase_stemmed',
            'fields': [ 'beer', 'title', 'Бренд', 'Название' ]
          }
        }
      }
    }
}

// nasted query
var nasted = (searchData) => {
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
  }
}

module.exports.search = query;
