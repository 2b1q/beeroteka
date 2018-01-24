var hashload = require('../models/hashloader'),
    elastic = require('../models/es_search'); // add es_search API

// default controller
exports.default = function(req, res){
  // get ALL styles AP + BA
  elastic.getAllStyles((styles) => {
    // console.log(`styles ${JSON.stringify(styles, null, 2)}`);
    res.render('catalog', { title: 'beer catalog', styles: styles});
  });
}

// searh controller
exports.search = function(req, res) {
  console.log('Req.query: '+req.query.query);
  var searchTerm = req.query.query || 'STOUT';
  elastic.search(searchTerm, function(data) {
    data.forEach(function(item){
      let score = item._source.score || item._source.BA_score;
      let score_percent = Math.round(score/0.05)
      item._source.score_percent = score_percent
    })
    // console.log('ES data: \n'+JSON.stringify(data, null, 2));
    res.render('search', { title: 'beer Search', user: req.session.username, results: data, query: searchTerm });
  });
}

// loadhashes controller
exports.loadhashes = function(req, res) {
  hashload.LoadHashes();
  res.redirect('/beers');
}
