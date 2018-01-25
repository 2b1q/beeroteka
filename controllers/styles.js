/** Style controller */
var elastic = require('../models/es_search'); // add es_search API

// common '/style' route controller
exports.styles = function(req, res) {
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

exports.ales = function(req, res) {
  console.log('---- invoke style.ale controller ----');
  res.redirect('/beers/styles');
}
