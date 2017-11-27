var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    query = require('./dsl');

var hashToLoad = {};

// Get All Docs FROM AP index
function getApDocs(){
  return new Promise(function(resolve, reject){
    es_client.client.search(query.ap_getAllDocs())
    .then(function(resp){
      resolve(resp.hits.hits)
    }, function(err){
      reject(err.message)
    })
  });
}

// searh Matches in BA index
function searchBaMatches(ApDocs){
  ApDocs.forEach(function(item, i){
    console.log(`------------
    Beer ${++i} name: "${item._source.beer}"
    Original beer name: "${item._source.Название}"
    Brewery: "${item._source.brewary}"
    Style: "${item._source['Вид пива']}"
    Страна: "${item._source.Страна}"
    ABV: "${item._source.abv}"`);
  })
}

var LoadHashes = function(){
  getApDocs()
  .then(searchBaMatches)
  .catch(error => {
    log.error(error.message)
  })
}

module.exports = {
  LoadHashes: LoadHashes
}
