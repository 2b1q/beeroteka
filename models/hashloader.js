var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    dict = require('./dict'), // rus > eng dict
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
    hashToLoad.ap_beer = item._source.beer || '';
    hashToLoad.ap_orig_beer_name = item._source['Название'];
    hashToLoad.ap_brewary = item._source.brewary || '';
    hashToLoad.ap_style = item._source['Вид пива'] || '';
    hashToLoad.ap_country = item._source['Страна'];
    hashToLoad.country_obj = dict.getCountry(item._source['Страна']) || {};
    hashToLoad.ap_abv = item._source.abv;
    hashToLoad.ap_vol = item._source['Объем'] || '';
    hashToLoad.ap_density = item._source['density'] || '';
    hashToLoad.ap_tara = item._source['Тара'] || '';
    hashToLoad.ap_type = item._source['Тип брожения'] || '';
    hashToLoad.ap_price_str = item._source['Цена'] || '';
    hashToLoad.ap_price_num = item._source['price'] || '';
    hashToLoad.ap_composition = item._source['Состав'] || '';
    hashToLoad.ap_url = item._source['url'] || '';
    hashToLoad.ap_taste = item._source['Вкусовые оттенки'] || '';
    hashToLoad.ap_desc = item._source['desc'] || {};
    console.log(`hashToLoad = ${JSON.stringify(hashToLoad)}`);

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
