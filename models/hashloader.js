var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    dict = require('./dict'), // rus > eng dict
    apivoModel = require('./apivoModel'), // Create Apivo schema model
    query = require('./dsl');

var ap_arr = [], // apivo search result array from ES
    ba_arr = []; // BeerAdvocate search result array from ES

apivoModel.find({}, function(err, docs){
  if(err) log.error(`ERROR while getting docs from mongo: "${err}"`)
  console.log(docs);
})

/** TODO
   - add search from BA in AP
   - PUSH to mongo collction BA (BA_arr.forEach LOOKUP in AP index)
   - PUSH to mongo collction AP (AP_arr.forEach LOOKUP in BA index)
*/
var ap_json = {}; // One matched AP JSON result from ES to LOAD
var ba_json = {}; // One matched BA JSON result from ES to LOAD

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
    ap_json.ap_beer = item._source.beer || '';
    ap_json.ap_orig_beer_name = item._source['Название'];
    ap_json.ap_brewary = item._source.brewary || '';
    ap_json.ap_style = item._source['Вид пива'] || '';
    ap_json.ap_country = item._source['Страна'];
    ap_json.country_obj = dict.getCountry(item._source['Страна']) || {};
    ap_json.ap_abv = item._source.abv;
    ap_json.ap_vol = item._source['Объем'] || '';
    ap_json.ap_density = item._source['density'] || '';
    ap_json.ap_tara = item._source['Тара'] || '';
    ap_json.ap_type = item._source['Тип брожения'] || '';
    ap_json.ap_price_str = item._source['Цена'] || '';
    ap_json.ap_price_num = item._source['price'] || '';
    ap_json.ap_composition = item._source['Состав'] || '';
    ap_json.ap_url = item._source['url'] || '';
    ap_json.ap_taste = item._source['Вкусовые оттенки'] || '';
    ap_json.ap_desc = item._source['desc'] || {};
    console.log(`${config.color.white}APIVO JSON: ${JSON.stringify(ap_json)}`);
    ap_arr.push(ap_json);

    // create BA query object
    let query_object = {
      beer: ap_json.ap_beer,
      beer_orig_name: ap_json.ap_orig_beer_name,
      brewary: ap_json.ap_brewary,
      style: ap_json.ap_style.replace(/[^a-zA-Z0-9 ]/g, ''),
      country: ap_json.country_obj.name,
      abv: (isInteger(ap_json.ap_abv) || isFloat(ap_json.ap_abv)) ? ap_json.ap_abv : 0
    }
    // console.log(config.color.white+JSON.stringify(query_object));
    // LookUP beer in BA from AP properties
    es_client.client.search(query.getBaFromAp(query_object))
      .then(function(resp){
        if( resp.hits.hits.length > 0 ) {
          // console.log(config.color.yellow+JSON.stringify(resp.hits.hits[0]));
          ba_json.ba_score =       resp.hits.hits[0]._score; // Do not use iterator [i] => caz first object is most relevanted response
          ba_json.ba_beer_score =  resp.hits.hits[0]._source.score;
          ba_json.ba_img =         resp.hits.hits[0]._source.img;
          ba_json.ba_title =       resp.hits.hits[0]._source.title;
          ba_json.ba_url =         resp.hits.hits[0]._source.url;
          ba_json.ba_ratings =     resp.hits.hits[0]._source.Ratings;
          ba_json.ba_reviews =     resp.hits.hits[0]._source.Reviews;
          ba_json.ba_abv =         resp.hits.hits[0]._source.abv;
          ba_json.ba_brewary =     resp.hits.hits[0]._source.brewary;
          ba_json.ba_beer =        resp.hits.hits[0]._source.beer;
          ba_json.ba_style =       resp.hits.hits[0]._source.style;
          ba_json.ba_category =    resp.hits.hits[0]._source.category;

          ba_arr.push(ba_json);
          /*
          INSERTING hashToLoad
          */
          console.log(`${config.color.yellow}BA JSON: ${JSON.stringify(ba_json)}`);
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
    console.log(`AP array length: "${ap_arr.length}"`);
    console.log(`BA array length: "${ba_arr.length}"`);

    setTimeout(function(){
      console.log(`${config.color.white} BA array length: "${ba_arr.length}"`);
    }, 4000)

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
