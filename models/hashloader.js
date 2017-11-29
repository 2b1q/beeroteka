var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    dict = require('./dict'), // rus > eng dict
    apivoModel = require('./apivoModel'), // Create Apivo schema model
    query = require('./dsl');

apivoModel.find({}, function(err, docs){
  if(err) log.error(`ERROR while getting docs from mongo: "${err}"`)
  console.log(docs);
})

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

    // console.log(config.color.white+JSON.stringify(query_object));

    // LookUP beer in BA from AP properties
    es_client.client.search(query.getBaFromAp(query_object))
      .then(function(resp){
        if( resp.hits.hits.length > 0 ) {
          // console.log(config.color.yellow+JSON.stringify(resp.hits.hits[0]));
          hashToLoad.ba_score =       resp.hits.hits[0]._score;
          hashToLoad.ba_beer_score =  resp.hits.hits[0]._source.score;
          hashToLoad.ba_img =         resp.hits.hits[0]._source.img;
          hashToLoad.ba_title =       resp.hits.hits[0]._source.title;
          hashToLoad.ba_url =         resp.hits.hits[0]._source.url;
          hashToLoad.ba_ratings =     resp.hits.hits[0]._source.Ratings;
          hashToLoad.ba_reviews =     resp.hits.hits[0]._source.Reviews;
          hashToLoad.ba_abv =         resp.hits.hits[0]._source.abv;
          hashToLoad.ba_brewary =     resp.hits.hits[0]._source.brewary;
          hashToLoad.ba_beer =        resp.hits.hits[0]._source.beer;
          hashToLoad.ba_style =       resp.hits.hits[0]._source.style;
          hashToLoad.ba_category =    resp.hits.hits[0]._source.category;
        }
        /*
          INSERTING hashToLoad
        */
        // console.log(config.color.yellow+JSON.stringify(hashToLoad));
        // Create an instance of model apivoModel
        if( hashToLoad.ba_score !== undefined && hashToLoad.ba_abv === hashToLoad.ap_abv ) {
          var hashToLoad_instance = new apivoModel(hashToLoad);
          // Save hashToLoad_instance, passing a callback
          hashToLoad_instance.save(function (err) {
            if (err) log.error(`ERROR while INSERTING data: "${err}"`);
            // saved!
          });
        }

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
