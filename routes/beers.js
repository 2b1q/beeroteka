var express = require('express'),
    router = express.Router(),
    elastic = require('../models/es_search'); // add es_search API

/** default /beers route */
router.get('/', function(req, res, next){
  console.log('Req.query: '+req.query.query);
  // set search query terms
  var searchTerm = req.query.query || 'STOUT';
  elastic.search(searchTerm, function(data) {
    //  «arr.forEach(callback[, thisArg])»
    // callback(item, i, arr):
    // item – очередной элемент массива.
    // i – его номер.
    // arr – массив, который перебирается.
    data.forEach(function(item, i, data){
      let score_percent = Math.round(data[i]._source.score/0.05)
      // console.log('Beer: "%s",\n OrigScore: "%d",\n Score: "%d \%"',
      // data[i]._source.beer,
      // data[i]._source.score,
      // score_percent);
      data[i]._source.score_percent = score_percent
    })

    console.log('ES data: \n'+JSON.stringify(data, null, 2));;
    res.render('beers', { title: 'Express +  Bootstrap + Pug + ElasticSearch', user: req.session.username, results: data, query: searchTerm });
    // res.render('beers', { title: 'Express +  Bootstrap + Pug + ElasticSearch', user: req.session.username, results: {}, query: searchTerm });
  });
});

module.exports = router;
