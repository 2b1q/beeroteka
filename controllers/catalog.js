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

/*
// loadhashes OLD controller
exports.loadhashes = function(req, res) {
  hashload.LoadHashes();
  res.redirect('/beers');
}

// loadhashes2 OLD controller
exports.LoadHashes2 = function(req, res) {
  hashload.LoadHashes2();
  res.redirect('/beers');
} */

// loadhashes REST controller
exports.dataload = id => {
  let str = 'call REST service hashload';
  switch (id) {
    case '1':
      str += 1;
      console.log(str);
      hashload.LoadHashes();
      return { msg: str }
      break;
    case '2':
      str += 2;
      console.log(str);
      hashload.LoadHashes2();
      return { msg: str }
      break;
    default: return { msg: 'bad ID' }
  }
}
