var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    dict = require('./dict'), // rus > eng dict
    apivoModel = require('./apivoModel'), // Create Apivo schema model
    query = require('./dsl');

var ap_arr = [], // apivo search result array from ES
    ba_arr = [], // BeerAdvocate search result array from ES
    result_arr = [];

var isFloat = n => n === +n && n !== (n|0),
    isInteger = n => n === +n && n === (n|0)

var fetched = false
var global_delay = 200

// build APJSON & Qery object
const buildJSON1 = (item) => {
  return new Promise(function(resolve){
    let JSON1 = {}, ap_json = {}
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
    // create BA query object
    let query_object = {
      beer: ap_json.ap_beer,
      beer_orig_name: ap_json.ap_orig_beer_name,
      brewary: ap_json.ap_brewary,
      style: ap_json.ap_style.replace(/[^a-zA-Z0-9 ]/g, ''),
      country: ap_json.country_obj.name,
      abv: (isInteger(ap_json.ap_abv) || isFloat(ap_json.ap_abv)) ? ap_json.ap_abv : 0
    }
    JSON1 = {
      ap_json: ap_json,
      query_object: query_object
    }
    resolve(JSON1)
  })
}

// ElasticSearch Search(es_query) Promise
const baReq = (es_query) => {
  return new Promise(function(resolve, reject){
    let JSON2 = {}, ba_json = {}
    es_client.client.search(query.getBaFromAp(es_query))
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
          JSON2 = { result: true, ba_json: ba_json }
          resolve(JSON2)
        } else {
          JSON2 = { result: false, ba_json: {} }
          resolve(JSON2)
        }
      }, function(err){
        reject(err.message)
      })
  })
}

// combine object async wrapper
const nextReq = async (ap_response_item) => {
  const data1 = await buildJSON1(ap_response_item)
  const data2 = await baReq(data1.query_object)
  // global_delay += 100
  // await ((ms) => {
  //   return new Promise((resolve) => {
  //     setTimeout(function () {
  //       console.log('tik tak '+global_delay);
  //       resolve('ok')
  //     }, ms);
  //   })
  // })(global_delay)
  let result = {}
  if(data2.result) result = { apdata: data1.ap_json, badata: data2.ba_json }
  else result = { apdata: data1.ap_json, badata: {} }
  result_arr.push(result)
  if( result_arr.length === config.es.apivoFetchSize ) fetched = true
  return result
}

// find mongo recs
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

// searh Matches in BeerAdvocate INDEX from Apivo INDEX response
function searchBaMatches(ApDocs){
  // combine object async wrapper
  ApDocs.forEach((item,i,arr) => {
    nextReq(item)
    if( i===arr.length-1 ) console.log(`forEach Done!
      Arr length: ${arr.length}
      i: ${i}
      `);
  })

// TODO: Promise resolve when data fetched
  setInterval(function () {
    console.log(`${config.color.cyan}Array length: ${config.color.white}${result_arr.length}`);
    console.log(`${config.color.yellow}fetched: ${fetched}`);
  }, 500);


}

// TODO: mongoose INSERTS
// mongoose INSERTS
// function insertData(data) {
//   return new Promise((resolve, reject) => {
//     data.forEach((item) => {
//       console.log(`\n${config.color.white} result data  AFTER delay: "${JSON.stringify(item)}"`);
//     })
//   })
// }

// common data loader
var LoadHashes = function(){
  getApDocs() // getData from APIVO INDEX
  .then(searchBaMatches) // pass result to next ElasticSearch request
  .catch(error => {
    log.error(error.message)
  })
}

module.exports = {
  LoadHashes: LoadHashes
}
