/** Style controller */
var elastic = require('../models/es_search'), // add es_search API
    co = require('co'),
    log = require('../libs/log')(module),
    apivoModel = require('../models/apivoModel');

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
  apivoModel.find({}, function(err, docs){
    if(err) log.error(`ERROR while getting docs from mongo: "${err}"`)
    console.log(`apivoModel docs: ${docs.length}`);
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

// mongoose find Ales
exports.ales = function(req, res) {
  console.log(`---- invoke style.ale controller ----`);
  console.log(`Req.query.p: "${req.query.p}", Req.query.s: "${req.query.s}"`);
  let options = param_normalizer(req.query.p, req.query.s);
  // MongoDB query
  let query = {
    $or: [ { ap_style: /ale/i }, { ba_style: /ale/i }, { ba_category: /ale/i } ]
    // $and: [ { ap_style: /ale/i }, { ba_style: /ale/i }, { ba_category: /ale/i } ]
  }
  apivoModel.find(query, function(err, docs) {
    if(err) log.error(`ERROR while getting docs from mongo: "${err}"`);
    // res.json(docs);
    // console.log(JSON.stringify(docs, null, 2));
    res.render('catalog', { title: 'Ale', beers: docs, options: options });
  })
  .skip(options.skip)
  .limit(options.limit);
}

// count MongoDocs Promise (for yield generator statements)
var doc_count_promise = (query) => {
  return apivoModel.count(query, function (err, count) {
    if(err) throw err.message;
  });
}

// find MongoDocs Promise (for yield generator statements)
var doc_find_promise = (query, options) => {
  return apivoModel.find(query, function (err, docs) {
    if(err) throw err.message;
    return docs; // return data
  })
  .skip(options.skip)
  .limit(options.limit);
}


// mongoose find style by pattern
exports.find = function (req, res) {
  console.log(`Req.query: "${req.query.q}"`);
  // temp options
  let options = {
    skip: 0,
    limit: 30
  }
  if(req.query.q === undefined) res.redirect('/beers');
  else {
    let pattern = req.query.q.replace(/[^a-zA-Z-/ '`]/g, '');
    console.log(`query pattern: "${pattern}"`);
    let regexp = new RegExp(pattern,'i');
    // MongoDB query
    let query = {
      $or: [ { ap_style: regexp }, { ba_style: regexp }, { ba_category: regexp } ]
    }

    // co wrap 2 async calls
    co(function* () {
      let count_docs_promise = yield doc_count_promise(query); // count docs for query
      let find_docs_promise = yield doc_find_promise(query, options); // then get docs for query
      console.log(`Found mongoDB docs: ${count_docs_promise}`);
      res.render('catalog', { title: 'Style: '+pattern, result: find_docs_promise, options: options, total: count_docs_promise });
    }).catch((err) => {
      log.error(err.message);
    });

  }
}
