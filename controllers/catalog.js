/** Catalog controller */
var hashload = require('../models/hashloader'),
    elastic = require('../models/es_search'); // add es_search API

// default route '/' Catalog controller
exports.default = function(req, res){
  // get ALL styles AP + BA
  elastic.getAllStyles((styles) => {
    // console.log(`styles ${JSON.stringify(styles, null, 2)}`);
    res.render('catalog', { title: 'beer catalog', styles: styles});
  });
}

// loadhashes controller
exports.loadhashes = function(req, res) {
  hashload.LoadHashes();
  res.redirect('/beers');
}

// loadhashes controller
exports.LoadChunks = function(req, res) {
  hashload.LoadChunks();
  res.redirect('/beers');
}
