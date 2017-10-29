var express = require('express'),
    router = express.Router(),
    elastic = require('../models/es_search'); // add es_search API

/** default /beers route */
router.get('/', function(req, res, next){
  console.log('Req.query: '+req.query.query);
  // set search query terms
  var searchTerm = req.query.query || 'STOUT';
  elastic.search(searchTerm, function(data) {
    // req.session.userName = 'Anonimous';
    // res.cookie('signed_token', 'omnomnom', { signed: true });
    res.render('beers', { title: 'Express +  Bootstrap + Pug + ElasticSearch', user: req.session.username, results: data, query: searchTerm });
  });
});

module.exports = router;
