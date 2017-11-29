var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    dict = require('./dict'), // rus > eng dict
    apivoModel = require('./apivoModel'), // Create Apivo schema model
    query = require('./dsl');

var arr1 = [],
    arr2 = [];

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
var hashToLoad2 = {}; // Common beer Hash to LOAD

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
  ApDocs.forEach(function(item){
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
    arr1.push(hashToLoad);

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
          hashToLoad2.ba_score =       resp.hits.hits[0]._score; // Do not use iterator [i] => caz first object is most relevanted response
          hashToLoad2.ba_beer_score =  resp.hits.hits[0]._source.score;
          hashToLoad2.ba_img =         resp.hits.hits[0]._source.img;
          hashToLoad2.ba_title =       resp.hits.hits[0]._source.title;
          hashToLoad2.ba_url =         resp.hits.hits[0]._source.url;
          hashToLoad2.ba_ratings =     resp.hits.hits[0]._source.Ratings;
          hashToLoad2.ba_reviews =     resp.hits.hits[0]._source.Reviews;
          hashToLoad2.ba_abv =         resp.hits.hits[0]._source.abv;
          hashToLoad2.ba_brewary =     resp.hits.hits[0]._source.brewary;
          hashToLoad2.ba_beer =        resp.hits.hits[0]._source.beer;
          hashToLoad2.ba_style =       resp.hits.hits[0]._source.style;
          hashToLoad2.ba_category =    resp.hits.hits[0]._source.category;

          arr2.push(hashToLoad2);
          /*
          INSERTING hashToLoad
          */
          console.log(config.color.yellow+JSON.stringify(hashToLoad2));
          // Create an instance of model apivoModel
          // var hashToLoad_instance = new apivoModel(hashToLoad2);
          // // Save hashToLoad_instance, passing a callback
          // hashToLoad_instance.save(function (err) {
          //   if (err) log.error(`ERROR while INSERTING data: "${err}"`);
          //   // saved!
          // });
        }
      }, function(err){
        log.error(err.message)
      })
    })
    console.log(`array1 length: "${arr1.length}"`);
    console.log(`array2 length: "${arr2.length}"`);

    setTimeout(function(){
      console.log(`${config.color.white} array3 length: "${arr2.length}"`);
    }, 1000)




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
