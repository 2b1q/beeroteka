var express = require('express'),
    router = express.Router(),
    hashload = require('../models/hashloader'),
    elastic = require('../models/es_search'); // add es_search API

/** default /beers route */
router.get('/', function(req, res, next){
  elastic.count(function(styles){
    console.log('Styles count result: %s', JSON.stringify(styles, null, 2));
  });

  console.log('Req.query: '+req.query.query);
  var searchTerm = req.query.query || 'STOUT';
  elastic.search(searchTerm, function(data) {
    data.forEach(function(item){
      let score = item._source.score || item._source.BA_score;
      let score_percent = Math.round(score/0.05)
      item._source.score_percent = score_percent
    })

    // console.log('ES data: \n'+JSON.stringify(data, null, 2));
    res.render('beers', { title: 'Express +  Bootstrap + Pug + ElasticSearch', user: req.session.username, results: data, query: searchTerm });
    // res.render('beers', { title: 'Express +  Bootstrap + Pug + ElasticSearch', user: req.session.username, results: {}, query: searchTerm });
  });
});

// styles JSON
router.get('/styles', function(req, res, next){
  elastic.getAllStyles(function(styles){
    // console.log(JSON.stringify(styles));
    res.json(styles);
  });
})

// LoadHashes
router.get('/loadhashes', function(req, res, next){
  hashload.LoadHashes();
  res.redirect('/beers');
})

module.exports = router;
