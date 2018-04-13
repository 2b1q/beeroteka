/** Search controller */
var elastic = require('../models/es_search'), // add es_search API
    config = require('../config/config'),
    log = require('../libs/log')(module),
    _ = require('lodash'),
    apivoModel = require('../models/apivoModel'),
    baModel = require('../models/baModel');

var run_statement = true;

// normalize query params
let param_normalizer = (p, s) => {
  let page = (isNaN(p)) ? 1 : Number (p).toFixed(); // default page = 1
  let size = (isNaN(s)) ? 20 : Number (s).toFixed(); // default size = 20 (if size 'undefined')
  page = (page >= 1) ? page : 1;
  size = (size >= 10) ? size : 10;
  let options = {
    limit: size,
    skip: (page*size)-size,
    page: page
  }
  console.log(`${config.color.white}-- Normalized params --
  Page: ${options.page}
  Limit: ${options.limit}
  Skip: ${options.skip}`);
  return options;
}

// simple search view
exports.search = function(req, res) {
  res.render('search', { title: 'Поиск по названию пива или пивоварни', user: req.session.username });
}

// Advanced search view
exports.search2 = function(req, res) {
  res.render('search2', { title: 'Расширенный поиск пива' });
}


// build_query with Promise object
function build_query(beer, brew, style, query_type, abv, country, ba_beer_score, logic) {
  return new Promise(function(resolve, reject) {
    let pattern = {};
    // cleanup user input fields
    beer.replace(/[^a-zA-Z-/ '|`öèä]/g, '');
    brew.replace(/[^a-zA-Z-/ '|`öèä]/g, '');
    style.replace(/[^a-zA-Z-/ '|`öèä]/g, '');
    // create regexp
    var beer_rxp = new RegExp(beer,'i'),
        brew_rxp = new RegExp(brew,'i');
        style_rxp = new RegExp(style,'i'),
        country_rxp = new RegExp(country,'i');
    // switch query_type
    if( query_type === 'normal' ) {
      if( beer === '' ) reject('bad query. Beer parameter must not be empty');
      else pattern.$or = [ { ap_beer: beer_rxp }, { ba_beer: beer_rxp } ]
      // construct Advanced query pattern
    } else if ( query_type === 'advanced' ) {
      let and = [];
      if(beer) and.push({ $or: [ { ap_beer: beer_rxp }, { ba_beer: beer_rxp } ] });
      if(brew) and.push({ $or: [ { ap_brewary: brew_rxp }, { ba_brewary: brew_rxp } ] });
      if(style) and.push({ $or: [ { ba_category: style_rxp }, { ba_style: style_rxp }, { ap_style: style_rxp } ] });
      if( country !== '' ) and.push({ $or: [ { ap_country: country_rxp }, { ba_category: country_rxp } ] });
      if( logic !== null ){
        if( _.has(logic,'arr') && Array.isArray(logic.arr))
          logic.arr.forEach((item) => { and.push(item) });
        else {
          run_statement = false;
          reject('bad logic query: '+JSON.stringify(logic,null,2));
        }
      }
      if( abv !== null ) {
        if( _.has(abv,'$gte') ||
            _.has(abv,'$gt')  ||
            _.has(abv,'$eq')  ||
            _.has(abv,'$lt')  ||
            _.has(abv,'$lte')
          ) and.push({ $or: [ { ap_abv: abv }, { ba_abv: abv } ] });
        else {
          run_statement = false;
          reject('bad query. Ex. "abv": { "$gte": 8}. Valid operators: [$eq, $gt, $gte, $lt, $lte]');
        }
      }
      if( ba_beer_score !== null ) {
        if( _.has(ba_beer_score,'$gte') ||
            _.has(ba_beer_score,'$gt')  ||
            _.has(ba_beer_score,'$eq')  ||
            _.has(ba_beer_score,'$lt')  ||
            _.has(ba_beer_score,'$lte')
          ) and.push({ ba_beer_score: ba_beer_score });
        else {
          run_statement = false;
          reject('bad query. Ex. "ba_beer_score": { "$gte": 8}. Valid operators: [$eq, $gt, $gte, $lt, $lte]');
        }
      }
      pattern.$and = and;
    } else reject('bad "query_type"');
    resolve(pattern);
  });
}


// count beer by query pattern Promise
function beerCountPromise(query, pattern) {
  return new Promise(function(resolve, reject) {
    baModel.count(pattern)
    .exec(function (err, count) {
      if(err) reject(err);
      if( count === 0 ){
        apivoModel.count(pattern)
        .exec(function (err, count) {
          if(err) reject(err);
          resolve({
            query: query,
            docs: count,
            collection: 'apivo_ba' // return apivoModel data
          })
        });
      } else resolve({
        query: query,
        docs: count,
        collection: 'ba_apivo'
      })
    })
  });
}

// mongoose search beer by query pattern Promise
function beerSearchPromise(query, pattern, options, collection) {
  return new Promise(function(resolve, reject) {
    if(collection ==='ba_apivo'){
      baModel.find(pattern)
      .skip(options.skip)
      .limit(options.limit)
      .exec(function(err, docs) {
        if(err) reject(`ERROR while getting docs from mongo: "${err}"`);
        // count 'baModel' collection docs by query pattern
        baModel.count(pattern).exec(function (err, count) {
          if(err) reject(err);
          if(count !== 0 )
            resolve({
              query: query, // raw query
              beers: docs, // docs objects (beer cards)
              options: options, // pagination params
              docs: count, // total docs
              collection: 'ba_apivo',
              pages: Math.ceil(count / options.limit)
            })
          else { // try lookup in apivoModel
            apivoModel.find(pattern).skip(options.skip).limit(options.limit)
            .exec(function(err, docs) {
              if(err) reject(`ERROR while getting docs from mongo: "${err}"`);
              // count docs by query pattern
              apivoModel.count(pattern).exec(function (err, count) {
                if(err) reject(err);
                // send 'apivoModel' collection docs with params
                resolve({
                  query: query, // raw query
                  beers: docs, // docs objects (beer cards)
                  options: options, // pagination params
                  docs: count, // total docs
                  collection: 'ba_apivo',
                  pages: Math.ceil(count / options.limit)
                })
              })
            });
          }
        });
      });
    } else {
      apivoModel.find(pattern)
      .skip(options.skip)
      .limit(options.limit)
      .exec(function(err, docs) {
        if(err) reject(`ERROR while getting docs from mongo: "${err}"`);
        // count docs by query pattern
        apivoModel.count(pattern).exec(function (err, count) {
          if(err) reject(err);
          // send 'apivoModel' collection docs with params
          resolve({
            query: query, // raw query
            beers: docs, // docs objects (beer cards)
            options: options, // pagination params
            docs: count, // total docs
            collection: 'apivo_ba',
            pages: Math.ceil(count / options.limit)
          })
        })
      })
    }

  });
}

// new Mongo search REST async await service controller
exports.ApiMongoSearchRest = content => {
  return new Promise(function(resolve, reject) {
    let query = content.query, // beer query params
        action = content.action || 'count';
        collection = content.collection || 'ba_apivo';
        options = param_normalizer(content.page, content.size); // paginator params
    // Prepare query
    let beer = query.beer || '',
        brew = query.brew || '',
        style = query.style || '',
        query_type = query.query_type || 'normal', // normal OR advanced
        abv = query.abv || null, // { $gte: 10 } => abv >= 10
        country = query.country || '',
        ba_beer_score = query.ba_beer_score || null, // { $gte: 10 } => ba_beer_score >= 10
        logic = query.logic || null;
    // construct Mongoose Query pattern Promise
    build_query(beer, brew, style, query_type, abv, country, ba_beer_score, logic)
      .then(pattern => {
        // if object pattern has properties $or OR $and
        if((_.has(pattern, '$or') || _.has(pattern, '$and')) && run_statement){
          // query logic
          if( action === 'count' )
            beerCountPromise(query, pattern)
              .then(data => resolve(data))
              .catch(err => reject(err))
          else if ( action === 'search' )
            beerSearchPromise(query, pattern, options, collection)
              .then(data => resolve(data))
              .catch(err => reject(err))
          else reject({ error: 'bad query' })
        }
      })
    .catch(err => reject(err))
  });
}

// new ES search REST async await service controller
exports.ApiEsSearchRest = term => {
  return new Promise(function(resolve, reject) {
    elastic.search(term, data => {
      data.forEach(function(item){
        let score = item._source.score || item._source.BA_score;
        let score_percent = Math.round(score/0.05)
        item._source.score_percent = score_percent
      })
      resolve(data)
    })
  });
}
