var es_client = require('../libs/elasticsearch'), // require ES module
    co = require("co"), // Simple wrapper to the request library for co-like interface (node.js generator based code).
    log = require('../libs/log')(module),
    config = require('../config/config'),
    _ = require('lodash'), // lodash chunks
    dict = require('./dict'), // rus > eng dict
    apivoModel = require('./apivoModel'), // Create Apivo schema model
    baModel = require('./baModel'), // Create Ba schema model
    query = require('./dsl');

var result_arr = [], // common result array
    matched = 0; // total HITS matched

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
  console.log("[ Phase 1 - Start ] => Scrolling all ES hits From BA index");
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
        console.log(`${config.color.white}[ Phase 1 - Done ]\n`);
        resolve(ba_result);
      }
    });
  });
}

// solving chunk items in parallel
function searchApDocs(chunk,i) {
  console.log(`${config.color.green}-resolving chunk ${i}`);
  return new Promise(function(resolve) {
    // async ES API searh AP index (1 item)
    var ap_search_item = ba_item => {
      // build searh object (avoid bad data in term query)
      let query_object = {
        beer: ba_item.beer.replace(/[^a-zA-Z0-9 '`]/g, ''), // drop specific symbols '@!$@^%..' caz ! -> crash the query 2
        brewary: ba_item.brewary.replace(/[^a-zA-Z0-9 '`]/g, ''),
        style: ba_item.style.replace(/[^a-zA-Z0-9 ]/g, ''),
        category: ba_item.category.replace(/[^a-zA-Z0-9 ]/g, ''),
        abv: (isInteger(ba_item.abv) || isFloat(ba_item.abv)) ? ba_item.abv : 0 // somtimes item._source.abv isNAN
      }
      return new Promise(function(resolve,reject) {
        es_client.client.search(query.search(query_object, 'ap_bool_query_string'))
        .then(function(resp) {
          let ba_json = {}, ap_json = {};
          // lookup AP hits
          let ap_obj = _.head(resp.hits.hits);
          if(_.has(ap_obj, '_source')) {
            // Create AP properties
            ap_json.ap_beer = ap_obj._source.beer || '';
            ap_json.ap_orig_beer_name = ap_obj._source['Название'];
            ap_json.ap_brewary = ap_obj._source.brewary || '';
            ap_json.ap_style = ap_obj._source['Вид пива'] || '';
            ap_json.ap_country = ap_obj._source['Страна'];
            ap_json.country_obj = dict.getCountry(ap_obj._source['Страна']) || {};
            ap_json.ap_abv = ap_obj._source.abv;
            ap_json.ap_img = ap_obj._source.img;
            ap_json.ap_vol = ap_obj._source['Объем'] || '';
            ap_json.ap_density = ap_obj._source['density'] || '';
            ap_json.ap_tara = ap_obj._source['Тара'] || '';
            ap_json.ap_type = ap_obj._source['Тип брожения'] || '';
            ap_json.ap_price_str = ap_obj._source['Цена'] || '';
            ap_json.ap_price_num = ap_obj._source['price'] || '';
            ap_json.ap_composition = ap_obj._source['Состав'] || '';
            ap_json.ap_url = ap_obj._source['url'] || '';
            ap_json.ap_taste = ap_obj._source['Вкусовые оттенки'] || '';
          }
          // BA properties
          ba_json.ba_beer_score =  ba_item.score;
          ba_json.ba_img =         ba_item.img;
          ba_json.ba_title =       ba_item.title;
          ba_json.ba_url =         ba_item.url;
          ba_json.ba_ratings =     ba_item.Ratings;
          ba_json.ba_reviews =     ba_item.Reviews;
          ba_json.ba_abv =         (isInteger(ba_item.abv) || isFloat(ba_item.abv)) ? ba_item.abv : 0; // fix ValidationError: baModel validation failed: ba_abv: Cast to Number failed for value "[ 0 ]" at path "ba_abv"
          ba_json.ba_brewary =     ba_item.brewary;
          ba_json.ba_beer =        ba_item.beer;
          ba_json.ba_style =       ba_item.style;
          ba_json.ba_category =    ba_item.category;

          // build result object
          let resolved_obj = {
            apdata: ap_json,
            badata: ba_json
          }
          // build result array
          result_arr.push(resolved_obj);
          // found matches
          if(resp.hits.hits.length>0) {
            matched++;
            console.log(config.color.yellow +"HIT matched"+ config.color.green);
          }
          // resolve async promise
          resolve(true);
        },function(err) {
          reject(err);
        });
      });
    };
    // solve async Promises in parallel
    Promise.all(chunk.map(ap_search_item)).then(() => { resolve(true) });
  });
}

// chunk resolver
function chunkResolver(chunks) {
  console.log(`[ Phase 2 - Start ] => Search in AP from BA index result.`);
  return new Promise(function(resolve) {
    let promise = Promise.resolve(); // start Promise queue
    chunks.forEach((chunk,i) => {
      promise = promise.then(() => {
        // resolve chunk (chunk_size) items
        return searchApDocs(chunk,i);
      });
    });
    promise.then(() => {
      console.log(`${config.color.white}[ Phase 2 - Done ] => Matched ${matched} objects\n`);
      resolve(true); // end Promise queue AND return Promise.resolve() to yield
    });
  });
}

function drop() {
  console.log(`[ Phase 3 - Start ] => Load result_arr ${result_arr.length} AP+BA items to baModel`);
  console.log(`${config.color.green}== Drop baModel IF exists ==`);
  return new Promise(function(resolve, reject) {
    baModel.remove({}, function(err) {
      if(err) reject(err.message);
      console.log(`${config.color.white} Done`);
      resolve(true);
    });
  });
}

function inserts(){
  console.log(`${config.color.green}== START INSERTS ==
  ${config.color.white}Total objects to insert: ${result_arr.length}
  ${config.color.white}Matched objects: ${matched}`);
  return new Promise(function(resolve, reject) {
    let promise = Promise.resolve(); // start Promise queue
    result_arr.forEach((item,i) => {
      promise = promise.then(() => {
        return (() => {
          // console.log(`item ${i}:\n${JSON.stringify(obj,null,2)}`);
          let obj = Object.assign(item.badata, item.apdata);
          let insert = new baModel(obj);
          return insert.save((err) => {
            if(err) throw err;
          });
        })();
      });
    });
    console.log(config.color.cyan+'ALL object saved');
    result_arr = null;
    resolve(true);
  });
}

/* LoadHashes2 co wrap
 1. get All BA docs using scroll API, split [] to chunks by 100 items(hits),
 2. Search in AP index from BA result
 chunk by chunk (chunkResolver) 100 async promises in parallel [Promise.all]
 3. Load result to baModel
 */
var LoadHashes2 = function() {
  let ba_chunks = []; // chunks amount
  let chunk_size = 100; // chunk size = 100 {obj} HITS
  co(function* () {
    // Phase 1
    ba_chunks = _.chunk(yield getBaDocs(), chunk_size);
    // ba_chunks = _.dropRight(ba_chunks, 1800); // debug
    log.info(`BA chunks amount: ${ba_chunks.length}\nchunk_size: ${chunk_size} items`);
    // Phase 2
    yield chunkResolver(ba_chunks);
    // Phase 3
    yield drop();
    yield inserts(); // result_arr
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
        let obj = Object.assign(item.apdata, item.badata);
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
