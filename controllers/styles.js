/** Style controller */
var elastic = require('../models/es_search'), // add es_search API
    co = require('co'),
    log = require('../libs/log')(module),
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

// common '/style' route controller
exports.styles = function(req, res) {
  // find/count mongo recs
  baModel.find({}, function(err, docs){
    if(err) log.error(`ERROR while getting docs from mongo: "${err}"`)
    console.log(`baModel docs: ${docs.length}`);
  })
  // req.query parser
  if(req.query.agg === 'ap1') {
    console.log('---- ap AGG1 ----');
    elastic.getApAgg1((styles) => {
      res.json(styles);
    })
  } else if(req.query.agg === 'ap2') {
    console.log('---- ap AGG2 ----');
    res.redirect('styles');
  } else if(req.query.agg === 'ba1') {
    console.log('---- ba AGG1 ----');
    elastic.getBaAgg1((styles) => {
      res.json(styles);
    })
  } else if(req.query.agg === 'ba2') {
    console.log('---- ba AGG2 ----');
    res.redirect('styles');
  } else {
    elastic.getAllStyles(function(styles){
      res.json(styles);
    });
  }
}

// mongoose find style by pattern
exports.find = function (req, res) {
  console.log(`Req.query: "${req.query.q}"`);
  let options = param_normalizer(req.query.p, req.query.s);

  if(req.query.q === undefined) res.redirect('/beers');
  else {
    let pattern = req.query.q.replace(/[^a-zA-Z-/ '`]/g, '');
    console.log(`query pattern: "${pattern}"`);
    let regexp = new RegExp(pattern,'i');
    // MongoDB query
    let query = {
      $or: [ { ap_style: regexp }, { ba_style: regexp }, { ba_category: regexp } ]
    }

    // get All docs by query pattern
    baModel.find(query)
      .skip(options.skip)
      .limit(options.limit)
      .exec(function(err, docs) {
        if(err) {
          log.error(`ERROR while getting docs from mongo: "${err}"`);
          return next(err);
        }
        // count docs by query pattern
        baModel.count(query).exec(function (err, count) {
          if(err) return next(err);
          // render context (docs + pagination properties)
          res.render('catalog', {
            title: pattern,
            beers: docs, // docs objects (beer cards)
            options: options,
            docs: count,
            pages: Math.ceil(count / options.limit)
          });
        })
      })

  }
}
