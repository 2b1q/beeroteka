var config = require('../config/config'),
    indexBa = config.es.index.ba, // ES Index name
    indexAll = config.es.index.all; // ES Index name

// common ES query function
var query = function(searchData, queryType){
  // console.log(config.color.yellow+'Query type: '+config.color.white+queryType);
  // console.log(config.color.yellow+'searchData params: '+config.color.white+JSON.stringify(searchData, null, 2));
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
    case 'ap_bool':
      return ap_bool(searchData);
    break;
    case 'bool_query_string':
      return bool_query_string(searchData);
    break;
    case 'ba_simple_query_string':
      return ba_simple_query_string(searchData);
    break;
    case 'match':
      return match(searchData);
    break;
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

// BA multi_match query
var ba_multi_match = (searchData) => {
  return {
    index: indexBa,
    body: {
        'query': {
          'multi_match' : {
            'query':  searchData,
            // 'fields': [ 'beer', 'brewary' ]
            'fields': [ 'beer' ]
          }
        }
      }
    }
}

// ap match
var match = (searchData) => {
  return {
    index: indexAll,
    body: {
        'query': {
          'match' : {
            'Название': {
              'query':  searchData,
              'cutoff_frequency' : 1
            }
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
        'size' : 20,
        'query': {
            'bool' : {
              'should' : [
                {'match' : { 'Название' : searchData.beer }},
              ],
              "should": [
                {"match" : { 'Бренд' : searchData.brewary }}
              ],
              // 'should' : [
              //   { 'match' : { 'Бренд' : searchData.brewary } },
              // ],
              'minimum_should_match' : 2,
              'boost' : 1.0
          }
      }
    }
  }
}

// BA simple_query_string
var ba_simple_query_string = (searchData) => {
  return {
    index: indexBa,
    body: {
        'from' : 0,
        'size' : 20,
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

var bool_query_string = (searchData) => {
  return {
    index: indexAll,
    body: {
      'from': 0,
      'size' : 10,
        "query": {
          "bool": {
            "should": {
              "query_string": {
                "query": searchData.beer,
                "fields": [
                  "Название^3",
                  "Бренд^2",
                ],
                "default_operator": "AND"
              }
            }
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
                            { "match" : {"apivo.Название" : searchData.beer} },
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
