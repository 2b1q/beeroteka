var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    dict = require('./dict'), // rus > eng dict
    query = require('./dsl');

/** TODO
   - add mongoose API
   - add search from BA in AP
   - PUSH to mongo collction BA (BA_arr.forEach LOOKUP in AP index)
   - PUSH to mongo collction AP (AP_arr.forEach LOOKUP in BA index)
*/
var hashToLoad = {}; // Common beer Hash to LOAD

var isFloat = n => n === +n && n !== (n|0),
    isInteger = n => n === +n && n === (n|0)

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
    // Create AP properties
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
    // console.log(`hashToLoad = ${JSON.stringify(hashToLoad)}`);

    // create BA query object
    let query_object = {
      beer: hashToLoad.ap_beer,
      beer_orig_name: hashToLoad.ap_orig_beer_name,
      brewary: hashToLoad.ap_brewary,
      style: hashToLoad.ap_style.replace(/[^a-zA-Z0-9 ]/g, ''),
      country: hashToLoad.country_obj.name,
      abv: (isInteger(hashToLoad.ap_abv) || isFloat(hashToLoad.ap_abv)) ? hashToLoad.ap_abv : 0
    }

    // LookUP beer in BA from AP properties
    es_client.client.search(query.getBaFromAp(query_object))
      .then(function(resp){
        console.log(config.color.yellow+JSON.stringify(hashToLoad));
        console.log(config.color.white+JSON.stringify(query_object));
        console.log(config.color.cyan+JSON.stringify(resp.hits.hits));
      }, function(err){
        log.error(err.message)
      })

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
