/** Catalog controller */
var hashload = require('../models/hashloader'),
    elastic = require('../models/es_search'); // add es_search API

// default route '/' Catalog controller
exports.default = function(req, res){
  // get ALL styles AP + BA
  elastic.getAllStyles((styles) => {
    res.render('catalog', { title: 'beer catalog', styles: styles});
  });
}

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
