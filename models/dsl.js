var config = require('../config/config'),
    apivo = config.es.index.apivo, // apivo index
    indexBa = config.es.index.ba, // ES Index name
    indexAll = config.es.index.all; // ES Index name

// common ES query function
var query = function(searchData, queryType){
  // console.log(config.color.yellow+'Query type: '+config.color.white+queryType);
  console.log(config.color.yellow+'searchData params: '+config.color.white+JSON.stringify(searchData, null, 2));
  switch (queryType) {
    case 'ap_bool_query_string':
      return ap_bool_query_string(searchData);
    break;
    case 'ba_simple_query_string':
      return ba_simple_query_string(searchData);
    break;
    case 'multi_match_analyzer':
      return multi_match_analyzer(searchData);
    break;
    case 'ap_bool':
      return ap_bool(searchData);
    break;
  }
}

// BA simple_query_string
var ba_simple_query_string = (searchData) => {
  return {
    index: indexBa,
    body: {
        'from' : 0,
        'size' : 10,
        'query': {
          'simple_query_string' : {
            'query':  searchData,
            // 'analyzer': 'snowball',
            'fields': [ 'beer^5', 'brewary' ],
            'default_operator' : 'and'
          }
        }
      }
    }
}

// ap bool_query_string
var ap_bool_query_string = (searchData) => {
  return {
    index: apivo,
    body: {
      'from': 0,
      'size' : 1, // return first matched result
        "query": {
          "bool": {
            "should": {
              "query_string": {
                "query": searchData.beer,
                "fields": [
                  "beer^4",
                ],
                "default_operator": "AND"
              }
            },
            "should": {
              "query_string": {
                "query": searchData.brewary,
                "fields": [
                  "brewary^3",
                ],
                "default_operator": "AND"
              }
            },
            // "filter": [
            //   {"match" : { "Бренд" : searchData.brewary }}
            // ],
            "minimum_should_match" : 1,
            "boost" : 1.0
          }
        }
    }
  }
}


// indexAll multi_match_analyzer
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

// AP term query
var ap_bool = (searchData) => {
  return {
    index: indexAll,
    body: {
        'from' : 0,
        'size' : 100,
        'query': {
            "bool" : {
              "must" : [
                {"match" : { "Название" : searchData.beer }}
              ],
              "filter": [
                {"term" : { "Бренд" : searchData.brewary }}
              ],
              "minimum_should_match" : 1,
              "boost" : 1.0
          }
      }
    }
  }
}

module.exports.search = query;
