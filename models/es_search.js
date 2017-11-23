/**
ES Search model
*/
var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    query = require('./dsl'),
    aggs = require('./aggs');

function resolveAfterDelay(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`${config.color.yellow}
      >>> RETURN RESULT 1 <<<\n`);
      resolve(data);
    }, config.es.promiseDelay);
  });
}

async function asyncDelay(data) {
  return await resolveAfterDelay(data);
}

function query2(result1data){
  let result1 = result1data.slice(0,1); // slice first elem for only one query matching
  return new Promise(function(resolve, reject){
    result1.forEach(function(item, i){
      let query_object = {
        beer: item._source.beer.replace(/[^a-zA-Z0-9 ']/g, ''), // drop specific symbols '@!$@^%..' caz ! -> crash the query 2
        brewary: item._source.brewary.replace(/[^a-zA-Z0-9 ']/g, ''),
        style: item._source.style.replace(/[^a-zA-Z0-9 ]/g, ''),
        category: item._source.category.replace(/[^a-zA-Z0-9 ]/g, ''),
        abv: item._source.abv
      }
      es_client.client.search(query.search(query_object, 'ap_bool_query_string'))
        .then(function(resp){
          // IF Query2 clauses have HITS then render this OBJ
          if( resp.hits.hits.length > 0 ) {
            log.info(`${config.color.yellow} QUERY 2 Hits count: ${config.color.white+resp.hits.hits.length}`)
            console.log(`${config.color.yellow}
              >>> RETURN RESULT 2 <<<\n`);
            resp.hits.hits[i]._source.BA_score = item._source.score;
            resp.hits.hits[i]._source.BA_beer = item._source.beer;
            resp.hits.hits[i]._source.BA_brewary = item._source.brewary;
            resp.hits.hits[i]._source.BA_img = item._source.img || 'no IMG';
            resp.hits.hits[i]._source.BA_url = item._source.url;
            resp.hits.hits[i]._source.BA_style = item._source.style;
            resp.hits.hits[i]._source.BA_Beers = item._source.Beers;
            resp.hits.hits[i]._source.BA_Ratings = item._source.Ratings;
            resp.hits.hits[i]._source.BA_category = item._source.category;
            resp.hits.hits[i]._source.BA_Reviews = item._source.Reviews;
            resp.hits.hits[i]._source.BA_abv = item._source.abv;
            console.log(`${config.color.white} Result 2 AP: ${JSON.stringify(resp.hits.hits[i]._source, null, 2)}`);
            // console.log(config.color.yellow+'Result 2 BA: '+JSON.stringify(item._source, null, 2));
            resolve(resp.hits.hits); // resolve Event OCCURED Only ONCE (means other ForEach resolve`s will be ignored )
          }
          else resolve(asyncDelay(result1data)); // async resolve wait 150 ms then resolve with first response
        }, function(err) {
            reject(err.message) // return err.stack
        });
      })
  })
}

var query1 = function(searchTxt1, callback){
  new Promise(function(resolve, reject){
    es_client.client.search(query.search(searchTxt1, 'ba_simple_query_string'))
      .then(function(resp){
          var result1 = resp.hits.hits;
          log.info(`${config.color.yellow} QUERY 1 BA Hits count: ${config.color.white+result1.length}`)
          if( result1.length === 0 ) {
            es_client.client.search(query.search(searchTxt1, 'apivo_simple_query_string'))
            .then(function(resp){
              result1 = resp.hits.hits;
              log.info(`${config.color.yellow} QUERY 1 APIVO Hits count: ${config.color.white+result1.length}`)
              callback(result1) // return callback
            }, function(err) {
              reject(err.message) // return err.stack
            })
          } // end  result1.length === 0 )
          else resolve(result1)
      }, function(err) {
          reject(err.message) // return err.stack
      });
  })
  .then(query2)
  .then(callback)
  .catch(error => {
    log.error(error)
    callback(error.message)
  })
}

// count styles
var countStyle = (callback) => {
  es_client.client.search(aggs.countStyle('American IPA'))
    .then(function(resp){
      // console.log('RESP CNT: %s', resp.hits.total);
      callback(resp.hits.total)
    }, function(err){
      log.error(err.message);
    })
}

// get all styles
var getAllStyles = (callback) => {
  es_client.client.search(aggs.countAllStyles())
    .then(function(resp){
      callback(resp)
    }, function(err){
      log.error(err.message);
    })
}

 module.exports = {
     search: query1,
     count:  countStyle,
     getAllStyles: getAllStyles
 };
