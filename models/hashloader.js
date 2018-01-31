var es_client = require('../libs/elasticsearch'), // require ES module
    co = require("co"), // Simple wrapper to the request library for co-like interface (node.js generator based code).
    log = require('../libs/log')(module),
    config = require('../config/config'),
    _ = require('lodash'), // lodash chunks
    dict = require('./dict'), // rus > eng dict
    apivoModel = require('./apivoModel'), // Create Apivo schema model
    apivoModel = require('./baModel'), // Create Ba schema model
    query = require('./dsl');

var result_arr = []; // common result array

var isFloat = n => n === +n && n !== (n|0),
    isInteger = n => n === +n && n === (n|0)

var fetched = false

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
    ap_json.ap_img = item._source.img;
    ap_json.ap_vol = item._source['Объем'] || '';
    ap_json.ap_density = item._source['density'] || '';
    ap_json.ap_tara = item._source['Тара'] || '';
    ap_json.ap_type = item._source['Тип брожения'] || '';
    ap_json.ap_price_str = item._source['Цена'] || '';
    ap_json.ap_price_num = item._source['price'] || '';
    ap_json.ap_composition = item._source['Состав'] || '';
    ap_json.ap_url = item._source['url'] || '';
    ap_json.ap_taste = item._source['Вкусовые оттенки'] || '';
    let {...desc} = item._source.desc; // ...rest [] All obj properties
    ap_json.ap_desc = desc || {};
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
const buildJSON2 = (es_query) => {
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
  const data2 = await buildJSON2(data1.query_object)
  let result = {}
  // if data2 exists join result2 to result1
  if(data2.result) result = { apdata: data1.ap_json, badata: data2.ba_json }
  else result = { apdata: data1.ap_json, badata: {} }
  result_arr.push(result)
  if( result_arr.length === config.es.apivoFetchSize ) fetched = true
  // if( result_arr.length % 100 === 0 ) return Promise.resolve()
  // return Promise.resolve()
}

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

/*
- get all BA docs from ES BA1 index using ES scroll API
- push HITS to ba_result[]
- return Promise
*/
function getBaDocs() {
  let ba_result = []; // BA result array
  return new Promise((resolve) => {
    es_client.client.search(query.ba_getAllDocs(),
    function getMoreUntilDone(err, resp) {
      if(err) throw err;
      // push each HIT to ba_result
      resp.hits.hits.forEach((hit) => {
        ba_result.push(hit._source);
      });
      // scroll again IF (resp.hits.total !== ba_result.length)
      if(resp.hits.total !== ba_result.length){
        // Next scroll
        es_client.client.scroll({
          scrollId: resp._scroll_id,
          scroll: '10s' // scroll timeout
        }, getMoreUntilDone);
      } else {
        console.log(`${config.color.green}All records fetched.\nHits.total: ${resp.hits.total}`);
        resolve(ba_result);
      }
    });
  });
}



// (ES) search in AP from BA index
function resolveChunk(chunk){
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("done");
    }, 500);
  });
}

// chunk resolver
function chunkResolver(chunks) {
  chunks.forEach((chunk, i) => {
    console.log(`${config.color.green}resolving chunk ${i}`);
    resolveChunk(chunk); // return Promise
  });
}

/* LoadHashes2 co wrap
 1. get All BA docs using scroll API, split [] to chunks by 1k items(hits),
 2. Search in AP index,
 3. Load result to baModel
 */
var LoadHashes2 = function() {
  let ba_chunks = []; // chunks amount
  let chunk_size = 100; // chunk size = 100 {obj} HITS
  co(function* () {
    console.log("[ Phase 1 - Start ] => Scrolling all ES hits From BA index");
    ba_chunks = _.chunk(yield getBaDocs(), chunk_size);
    console.log(`BA chunks amount: ${ba_chunks.length}\nchunk_size: ${chunk_size} items`);
    console.log(`${config.color.white}[ Phase 1 - Done ]\n`);
    // Phase 2
    console.log(`[ Phase 2 - Start ] => Search in AP from BA index result.`);
    yield chunkResolver(ba_chunks);

  }).catch((err) => {
    log.error(`LoadChunks error: ${err.message}`);
  })
}


// searh Matches in BeerAdvocate INDEX from Apivo INDEX response
function searchBaMatches(ApDocs){
  return new Promise((resolve) => {
    // TODO split ApDocs Array by 17 chunks of 100 items (each chunk resolve() Search Promise)
    // chunks = _.chunk(ApDocs, 100)
    let promise = Promise.resolve()
    console.log(`\n${config.color.white}========[ ${config.color.green}start queue with ${ApDocs.length} items ${config.color.white}]========`);
    ApDocs.forEach((item) => {
      promise = promise.then(() => {
        // combine object async wrapper
        return nextReq(item)
      })
    })
    promise.then(() => {
      console.log(`Queue done!
        ${config.color.white}result_arr length: ${result_arr.length}`);
      resolve('resolve')
    })
  })
}

// mongoose INSERTS
function insertData() {
  return new Promise((resolve, reject) => {
    // generator + Promise CO wrapper
    co(function* (){
      console.log(`${config.color.green}============= START DELETE =============`);
      yield apivoModel.remove({}, function(err) {
        if(err) log.error(err.message);
        console.log(`${config.color.green}============= DELETE COMPLETE =============`);
      });
      console.log(`${config.color.white}============= START INSERTS =============`);
      result_arr.forEach((item) => {
        let obj = Object.assign(item.apdata, item.badata)
        let insert = new apivoModel(obj);
        insert.save((err) => {
          if(err) reject(err.message)
        })
      })
      console.log(`${config.color.white}============= ALL object saved =============${config.color.yellow}`);
      resolve({})
    }).catch((err) => {
      reject(err)
    })
  })
}

// common data loader
var LoadHashes = function(){
  getApDocs() // getData from APIVO INDEX
  .then(searchBaMatches) // pass result to next ElasticSearch request
  .then(insertData) // mongo INSERTS
  .catch(error => {
    log.error(error.message)
  })
}

module.exports = {
  LoadHashes: LoadHashes, // get AP docs, Search in BA, load to apivoModel
  LoadHashes2: LoadHashes2 // get All BA docs using scroll API, Search in AP index, Load result to baModel
}
