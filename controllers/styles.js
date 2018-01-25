/** Style controller */
var elastic = require('../models/es_search'), // add es_search API
    log = require('../libs/log')(module),
    apivoModel = require('../models/apivoModel');

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
  console.log(`Req.query.p: ${req.query.p}
    Req.query.s: ${req.query.s}`);
  let page = (isNaN(req.query.p)) ? 1 : Number (req.query.p).toFixed(); // default page = 1
  page = (page >= 1) ? page : 1;
  let size = (isNaN(req.query.s)) ? 20 : Number (req.query.s).toFixed(); // default size = 20 (if size 'undefined')
  size = (size >= 10) ? size : 10;
  let options = {
    limit: size,
    skip: (page*size)-size
  }
  console.log(`
    Page: ${page}
    Limit: ${options.limit}
    Skip: ${options.skip}
    `);
  let query = {
    $or: [ { ap_style: /ale/i }, { ba_style: /ale/i }, { ba_category: /ale/i } ]
    // $and: [ { ap_style: /ale/i }, { ba_style: /ale/i }, { ba_category: /ale/i } ]
  }
  apivoModel.find(query, function(err, docs) {
    if(err) log.error(`ERROR while getting docs from mongo: "${err}"`);
    res.json(docs);
  })
  .skip(options.skip)
  .limit(options.limit);


}
