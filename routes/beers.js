var express = require('express'),
    router = express.Router(),
    hashload = require('../models/hashloader'),
    elastic = require('../models/es_search'); // add es_search API

/** default /beers route "/" => Catalog view */
router.get('/', function(req, res, next) {
  // get ALL styles AP + BA
  elastic.getAllStyles((styles) => {
    // console.log(`styles ${JSON.stringify(styles, null, 2)}`);
    res.render('catalog', { title: 'beer catalog', styles: styles});
  });
});

// searh view
router.get('/search', function(req, res, next){
  // search query
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
});

// styles JSON
router.get('/styles', function(req, res, next){
  if(req.query.agg === 'ap1') {
    elastic.getApAgg1((styles) => {
      res.json(styles);
    })
  }
  if(req.query.agg === 'ap2') {
    console.log('---- ap AGG2 ----');
    res.redirect('styles');
  }
  if(req.query.agg === 'ba1') {
    console.log('---- ba AGG1 ----');
    res.redirect('styles');
  }
  if(req.query.agg === 'ba2') {
    console.log('---- ba AGG2 ----');
    res.redirect('styles');
  }
  else
  elastic.getAllStyles(function(styles){
    res.json(styles);
  });
})

// LoadHashes
router.get('/loadhashes', function(req, res, next){
  hashload.LoadHashes();
  res.redirect('/beers');
})

module.exports = router;
