/** Search controller */
var elastic = require('../models/es_search'), // add es_search API
    config = require('../config/config'),
    log = require('../libs/log')(module),
    _ = require('lodash'),
    apivoModel = require('../models/apivoModel'),
    baModel = require('../models/baModel');

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
  console.log(`-- Normalized params --
  Page: ${options.page}
  Limit: ${options.limit}
  Skip: ${options.skip}`);
  return options;
}

// GET controller
exports.search = function(req, res) {
  res.render('search', { title: 'beer Search', user: req.session.username });
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


// count beer by query pattern
function beerCount(query, pattern, res) {
  baModel.count(pattern)
  .exec(function (err, count) {
    if(err) return next(err);
    if( count === 0 ){
        apivoModel.count(pattern)
        .exec(function (err, count) {
          if(err) return next(err);
          // return apivoModel data
          res.json({
            query: query,
            docs: count,
            collection: 'apivo_ba'
          });
        });
    } else {
      // return baModel
      res.json({
        query: query,
        docs: count,
        collection: 'ba_apivo'
      });
    }
  })
}

// get beer by query pattern
function beerSearch(query, pattern, options, res, collection) {
  if(collection ==='ba_apivo'){
    // get All docs by query pattern from 'ba_apivo' collection
    baModel.find(pattern)
    .skip(options.skip)
    .limit(options.limit)
    .exec(function(err, docs) {
      if(err) {
        log.error(`ERROR while getting docs from mongo: "${err}"`);
        return next(err);
      }
      // count docs by query pattern
      baModel.count(pattern).exec(function (err, count) {
        if(err) return next(err);
        // send JSON data with params
        res.json({
          query: query, // raw query
          beers: docs, // docs objects (beer cards)
          options: options, // pagination params
          docs: count, // total docs
          collection: 'ba_apivo',
          pages: Math.ceil(count / options.limit)
        });
      })
    })
  } else {
    // get All docs by query pattern from 'apivoModel' collection
    apivoModel.find(pattern)
    .skip(options.skip)
    .limit(options.limit)
    .exec(function(err, docs) {
      if(err) {
        log.error(`ERROR while getting docs from mongo: "${err}"`);
        return next(err);
      }
      // count docs by query pattern
      apivoModel.count(pattern).exec(function (err, count) {
        if(err) return next(err);
        // send JSON data with params
        res.json({
          query: query, // raw query
          beers: docs, // docs objects (beer cards)
          options: options, // pagination params
          docs: count, // total docs
          collection: 'apivo_ba',
          pages: Math.ceil(count / options.limit)
        });
      })
    })
  }

}

// POST advanced Mongoose search controller
exports.ApiPostSearchMongo = function (req, res) {
  if(!req.body.hasOwnProperty('query')) {
    console.log(`${config.color.cyan}Bad query: ${JSON.stringify(req.body,null,2)}`);
    res.status(500).json({ error: 'bad query' });
  } else {
    console.log(`${config.color.cyan}Ajax HTTP POST Req.body: ${JSON.stringify(req.body,null,2)}`);
    let query = req.body.query, // beer query params
        action = req.body.action || 'count';
        collection = req.body.collection || 'ba_apivo';
        options = param_normalizer(req.body.page, req.body.size); // paginator params

    // Prepare query
    let beer = query.beer || '',
        brew = query.brew || '';

    // beer.replace(/[^a-zA-Z-/ '|`öè]/g, '') || '';
    // brew.replace(/[^a-zA-Z-/ '|`öè]/g, '') || '';

    let beer_rxp = new RegExp(beer,'i'),
        brew_rxp = new RegExp(brew,'i');
    // MongoDB pattern query
    let pattern = {
      $or: [ { ap_beer: beer_rxp }, { ba_beer: beer_rxp } ]
    }


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
