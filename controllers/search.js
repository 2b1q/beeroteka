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
  res.render('search', { title: 'beer Search', user: req.session.username });
}

// Advanced search view
exports.search2 = function(req, res) {
  res.render('search2', { title: 'advanced beer Search' });
}

// GET Ajax API 'beers/api/search'
exports.ApiGetSearch = function (req,res) {
  var searchTerm = req.query.query || 'STOUT';
  console.log(`${config.color.cyan}Ajax HTTP GET Req.query: ${searchTerm}`);

  elastic.search(searchTerm, function(data) {
    data.forEach(function(item){
      let score = item._source.score || item._source.BA_score;
      let score_percent = Math.round(score/0.05)
      item._source.score_percent = score_percent
    })
    res.json(data);
  });
}

// send count result
function json_resp_cnt(query, res, count, collection) {
  res.json({
    query: query,
    docs: count,
    collection: collection
  });
}

// docs response
function json_resp_docs(query, res, count, collection, docs) {
  res.json({
    query: query, // raw query
    beers: docs, // docs objects (beer cards)
    options: options, // pagination params
    docs: count, // total docs
    collection: 'ba_apivo',
    pages: Math.ceil(count / options.limit)
  });
}

// count beer by query pattern
function beerCount(query, pattern, res) {
  baModel.count(pattern)
  .exec(function (err, count) {
    if(err) return next(err);
    if( count === 0 ){
      apivoModel.count(pattern)
      .exec(function (err, count) {
        if(err) return next(err);
          json_resp_cnt(query, res, count, 'apivo_ba'); // return apivoModel data
        });
    } else json_resp_cnt(query, res, count, 'ba_apivo');
  })
}

// get beer by query pattern
function beerSearch(query, pattern, options, res, collection) {
  if(collection ==='ba_apivo'){
    baModel.find(pattern)
    .skip(options.skip)
    .limit(options.limit)
    .exec(function(err, docs) {
      if(err) return next(`ERROR while getting docs from mongo: "${err}"`);
      // count 'baModel' collection docs by query pattern
      baModel.count(pattern).exec(function (err, count) {
        if(err) return next(err);
        // send docs with params
        json_resp_docs(query, res, count, 'ba_apivo', docs);
      })
    })
  } else {
    apivoModel.find(pattern)
    .skip(options.skip)
    .limit(options.limit)
    .exec(function(err, docs) {
      if(err) return next(`ERROR while getting docs from mongo: "${err}"`);
      // count docs by query pattern
      apivoModel.count(pattern).exec(function (err, count) {
        if(err) return next(err);
        // send 'apivoModel' collection docs with params
        json_resp_docs(query, res, count, 'apivo_ba', docs);
      })
    })
  }
}

// build mongoose query pattern
function build_query_pattern(beer, brew, style, query_type, abv, country, ba_beer_score, res) {
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
    if( beer === '' ) res.status(500).json({ error: 'bad query. Beer parameter must not be empty' });
    else pattern.$or = [ { ap_beer: beer_rxp }, { ba_beer: beer_rxp } ]
  // construct Advanced query pattern
  } else if ( query_type === 'advanced' ) {
    let and = [];
    if( beer !== '' ) and.push({ $or: [ { ap_beer: beer_rxp }, { ba_beer: beer_rxp } ] });
    if( brew !== '' ) and.push({ $or: [ { ap_brewary: brew_rxp }, { ba_brewary: brew_rxp } ] });
    if( style !== '' ) and.push({ $or: [ { ba_category: style_rxp }, { ba_style: style_rxp }, { ap_style: style_rxp } ] });
    if( country !== '' ) and.push({ $or: [ { ap_country: country_rxp }, { ba_category: country_rxp } ] });
    if( abv !== null ) {
      if( _.has(abv,'$gte') ||
          _.has(abv,'$gt')  ||
          _.has(abv,'$eq')  ||
          _.has(abv,'$lt')  ||
          _.has(abv,'$lte')
        ) and.push({ $or: [ { ap_abv: abv }, { ba_abv: abv } ] });
      else {
        run_statement = false;
        res.status(500).json({ error: 'bad query. Ex. "abv": { "$gte": 8}. Valid operators: [$eq, $gt, $gte, $lt, $lte]' });
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
        res.status(500).json({ error: 'bad query. Ex. "ba_beer_score": { "$gte": 8}. Valid operators: [$eq, $gt, $gte, $lt, $lte]' });
      }
    }

    pattern.$and = and;
  } else res.status(500).json({ error: 'bad "query_type"' });
  return pattern;
}

// POST advanced Mongoose search controller
exports.ApiPostSearchMongo = function (req, res) {
  if(!req.body.hasOwnProperty('query')) {
    log.error(`${config.color.red}Bad query: ${JSON.stringify(req.body,null,2)}`);
    res.status(500).json({ error: 'bad query' });
  } else {
    log.info(`${config.color.cyan}\nAjax HTTP POST Req.body: ${JSON.stringify(req.body,null,2)}`);
    let query = req.body.query, // beer query params
        action = req.body.action || 'count';
        collection = req.body.collection || 'ba_apivo';
        options = param_normalizer(req.body.page, req.body.size); // paginator params

    // Prepare query
    let beer = query.beer || '',
        brew = query.brew || '',
        style = query.style || '',
        query_type = query.query_type || 'normal', // normal OR advanced
        abv = query.abv || null, // { $gte: 10 } => abv >= 10
        country = query.country || '',
        ba_beer_score = query.ba_beer_score || null; // { $gte: 10 } => ba_beer_score >= 10

    let pattern = build_query_pattern(beer, brew, style, query_type, abv, country, ba_beer_score, res);
    console.log(`${config.color.green}Mongoose Query pattern:\n ${JSON.stringify(pattern,null,2)}`);

    // if object pattern has properties $or OR $and
    if((_.has(pattern, '$or') || _.has(pattern, '$and')) && run_statement){
      // query logic
      if( action === 'count' ){
        beerCount(query, pattern, res);
      } else if ( action === 'search' ) {
        beerSearch(query, pattern, options, res, collection);
      } else {
        console.log(`${config.color.cyan}Bad query: ${JSON.stringify(req.body,null,2)}`);
        res.status(500).json({ error: 'bad query' });
      }
    }

  }
}
