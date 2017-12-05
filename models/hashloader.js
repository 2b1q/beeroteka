var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    dict = require('./dict'), // rus > eng dict
    apivoModel = require('./apivoModel'), // Create Apivo schema model
    query = require('./dsl');

var ap_arr = [], // apivo search result array from ES
    ba_arr = [], // BeerAdvocate search result array from ES
    result_arr = [];

var ap_json = {}, // One matched AP JSON result from ES to LOAD
    ba_json = {}; // One matched BA JSON result from ES to LOAD

var isFloat = n => n === +n && n !== (n|0),
    isInteger = n => n === +n && n === (n|0)

const timeout = ms => new Promise(res => setTimeout(res, ms))

function baQuery(query_object) {
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
    } else {
      ba_json = {}
    }
    let apjson = query_object.ap_obj;
    // ba_arr.push(ba_json)
    // (async function(apjson, ba_json){
    //   await timeout(200)
      result_arr.push({apjson, ba_json})
    // })(apjson, ba_json);
  }, function(err){
    log.error(err.message);
  })

  // ap_arr.push(ap_json)
  // ba_arr.push(ba_json)
  // result_arr.push({ap_json, ba_json})
  // console.log(`${config.color.white}BA JSON: ${JSON.stringify(ba_json)}`);
  // console.log(`${config.color.yellow}APIVO JSON: ${JSON.stringify(ap_json)}`);
}


apivoModel.find({}, function(err, docs){
  if(err) log.error(`ERROR while getting docs from mongo: "${err}"`)
  console.log(docs);
})

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
  for(let i=0; i< ApDocs.length; i++){
    // Create AP properties
    ap_json.ap_beer = ApDocs[i]._source.beer || '';
    ap_json.ap_orig_beer_name = ApDocs[i]._source['Название'];
    ap_json.ap_brewary = ApDocs[i]._source.brewary || '';
    ap_json.ap_style = ApDocs[i]._source['Вид пива'] || '';
    ap_json.ap_country = ApDocs[i]._source['Страна'];
    ap_json.country_obj = dict.getCountry(ApDocs[i]._source['Страна']) || {};
    ap_json.ap_abv = ApDocs[i]._source.abv;
    ap_json.ap_vol = ApDocs[i]._source['Объем'] || '';
    ap_json.ap_density = ApDocs[i]._source['density'] || '';
    ap_json.ap_tara = ApDocs[i]._source['Тара'] || '';
    ap_json.ap_type = ApDocs[i]._source['Тип брожения'] || '';
    ap_json.ap_price_str = ApDocs[i]._source['Цена'] || '';
    ap_json.ap_price_num = ApDocs[i]._source['price'] || '';
    ap_json.ap_composition = ApDocs[i]._source['Состав'] || '';
    ap_json.ap_url = ApDocs[i]._source['url'] || '';
    ap_json.ap_taste = ApDocs[i]._source['Вкусовые оттенки'] || '';
    ap_json.ap_desc = ApDocs[i]._source['desc'] || {};
    // console.log(`${config.color.white}APIVO JSON: ${JSON.stringify(ap_json)}`);
    // ap_arr.push(ap_json);

    // create BA query object
    let query_object = {
      beer: ap_json.ap_beer,
      beer_orig_name: ap_json.ap_orig_beer_name,
      brewary: ap_json.ap_brewary,
      style: ap_json.ap_style.replace(/[^a-zA-Z0-9 ]/g, ''),
      country: ap_json.country_obj.name,
      abv: (isInteger(ap_json.ap_abv) || isFloat(ap_json.ap_abv)) ? ap_json.ap_abv : 0,
      ap_obj: ap_json
    }

    // Object.assign(target, ...sources)
    // var result_arr = [];
    //
    // (async function delay () {
    //   console.log(`${config.color.white}APIVO JSON: ${JSON.stringify(ap_json)}`);
    //   await setTimeout(()=>{
    //     baQuery(query_object)
    //   }, 400)
    // })()
    // console.log(`${config.color.yellow}BA JSON: ${JSON.stringify(ba_json)}`);

    // console.log(config.color.white+JSON.stringify(query_object));
    // LookUP beer in BA from AP properties

    baQuery(query_object, ap_json)
  }

  // console.log(`AP array length before delay: "${ap_arr.length}"`);
  // console.log(`BA array length before delay: "${ba_arr.length}"`);

  setTimeout(function(){
    // console.log(`${config.color.yellow} BA array length AFTER delay: "${ba_arr.length}"`);
    // console.log(`${config.color.white} AP array length AFTER delay: "${ap_arr.length}"`);

    result_arr.forEach(function(item){
      console.log(`${config.color.cyan} result data  AFTER delay: "${JSON.stringify(item)}"`);
    })
  }, 5000)

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
