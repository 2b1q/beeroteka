var config = require('../config/config'),
    indexBa = config.es.index.ba, // ES Index name
    indexAll = config.es.index.all; // ES Index name

// common ES query function
var query = function(searchData, queryType){
  console.log('Query type: '+queryType);
  console.log('searchData params: '+JSON.stringify(searchData, null, 2));
  switch (queryType) {
    case 'multi_match_analyzer':
      return multi_match_analyzer(searchData);
    break;
    case 'ba_multi_match':
      return ba_multi_match(searchData);
    break;
    case 'nasted':
      return nasted(searchData);
    break;
  }
}

// multi_match query
var multi_match_analyzer = (searchData) => {
  return {
    index: indexAll,
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

// BA multi_match query
var ba_multi_match = (searchData) => {
  return {
    index: indexBa,
    body: {
        'query': {
          'multi_match' : {
            'query':  searchData,
            'fields': [ 'beer', 'brewary' ]
          }
        }
      }
    }
}

// nasted query
var nasted = (searchData) => {
  return {
    index: indexAll,
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
