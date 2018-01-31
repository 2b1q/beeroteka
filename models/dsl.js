var config = require('../config/config'),
    apivo = config.es.index.apivo, // apivo index
    indexBa = config.es.index.ba, // ES Index name
    indexAll = config.es.index.all; // ES Index name

// common ES query function
var query = function(searchData, queryType){
  // console.log(`${config.color.yellow} Query type: ${config.color.white+queryType}`);
  // console.log(`${config.color.yellow} searchData params: ${config.color.white+JSON.stringify(searchData, null, 2)}`);
  switch (queryType) {
    case 'ap_bool_query_string':
      return ap_bool_query_string(searchData);
    break;
    case 'ba_simple_query_string':
      return ba_simple_query_string(searchData);
    break;
    case 'apivo_simple_query_string':
      return apivo_simple_query_string(searchData);
    break;
  }
}

// APIVO simple_query_string
var apivo_simple_query_string = (searchData) => {
  return {
    index: apivo,
    body: {
        'from' : 0,
        'size' : 10,
        'query': {
          'simple_query_string' : {
            'query':  searchData,
            // 'analyzer': 'custom_russian_analyzer',
            'analyzer': 'snowball',
            'fields': [ 'beer^5', 'brewary^4' ],
            'default_operator' : 'and'
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
        'size' : 10,
        'query': {
          'simple_query_string' : {
            'query':  searchData,
            // 'analyzer': 'snowball',
            'fields': [ 'beer^5', 'brewary^4' ],
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
            "must": [ // must => AND statement
              { "match": { "beer": searchData.beer } }, // match => One of token OR more
              { "match": { "Вид пива": searchData.style } },
              { "match": { "brewary": searchData.brewary } },
              { "term" : { "abv" : searchData.abv }}, // term => ABV=ABV
              { "bool":
                {
                "should" : [ // should => OR statement
                     { "term" : {"beer" : searchData.beer}}, // WHERE (beer = searchData.beer OR Название = searchData.beer)
                     { "term" : {"Название" : searchData.beer}},
                     { "term" : {"brewary" : searchData.brewary}},
                     { "term" : {"Вид пива" : searchData.style}},
                     { "match":
                        {
                          "beer": {
                            "query": searchData.beer,
                            "cutoff_frequency" : 0.001
                          }
                        }
                     }
                  ]
                },
              }
            ],
            "should": {
              "query_string": {
                "query": searchData.style,
                "fields": [
                  "Вид пива^3",
                ],
                "default_operator": "OR" // one of tokens..
              }
            },
            // "filter": [
            //   {"match" : { "abv" : searchData.abv }}
            // ],
            "minimum_should_match" : 1,
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

// AP getAll data
var ap_getAllDocs = () => {
  return {
    index: apivo,
    body: {
        'from' : 0,
        'size' : config.es.apivoFetchSize, // default 1700
        "query": { "match_all": {} }
    }
  }
}

// BA getAll data
var ba_getAllDocs = () => {
  return {
    index: indexBa,
    scroll: '10s', // scroll timeout
    // _source: ['beer'],
    body: {
        "query": { "match_all": {} }
    }
  }
}

// ba bool_query_string
var ba_bool_query_string = (searchData) => {
  return {
    index: indexBa,
    body: {
      'from': 0,
      'size' : 1, // return first matched result
        "query": {
          "bool": { // {"beer":"Pale Ale","beer_orig_name":"Bastogne Pale Ale","brewary":"Bastogne","style":"Pale Ale  Belgian","country":"Belgium","abv":5}
            "must": [ // must => AND statement
              { "match": { "beer": searchData.beer } }, // match => One of token OR more
              { "match": { "style": searchData.style } },
              { "match": { "brewary": searchData.brewary } },
              // { "match": { "category": searchData.country } },
              { "term" : { "abv" : searchData.abv }}, // term => ABV=ABV
              { "bool":
                {
                "should" : [ // should => OR statement
                     { "term" : {"beer" : searchData.beer}}, // WHERE (beer = searchData.beer OR Название = searchData.beer)
                     { "term" : {"beer" : searchData.beer_orig_name}},
                     { "term" : {"brewary" : searchData.brewary}},
                     { "term" : {"style" : searchData.style}},
                     { "match":
                        {
                          "beer": {
                            "query": searchData.beer,
                            "cutoff_frequency" : 0.001
                          }
                        }
                     }
                  ]
                },
              }
            ],
            "should": {
              "query_string": {
                "query": searchData.style,
                "fields": [
                  "style^3",
                ],
                "default_operator": "OR" // one of tokens..
              }
            },
            // "filter": [
            //   {"match" : { "abv" : searchData.abv }}
            // ],
            "minimum_should_match" : 1,
          }
        }
    }
  }
}

module.exports = {
  search: query,
  ap_getAllDocs: ap_getAllDocs,
  ba_getAllDocs: ba_getAllDocs,
  getBaFromAp: ba_bool_query_string
}
