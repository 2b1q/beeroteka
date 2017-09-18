var express = require('express');
var router = express.Router();
var elastic = require('../models/es_search');
var apivo_es = require('../models/apivo_es'); // add apivo_es model

/* GET hobeers page. */
// router.get('/', function(req, res, next) {
//   //elastic.search_txt();
//   //.then(function (result) {  res.json(result) });
//   elastic.searchByParams(apivo_es.indexName, 1, 10, 'IPA');
//   res.render('beers', {
//      title: 'Beers',
//     //  beers: elastic.es_data.hits.hits[0]._source.result
//     beers: {'title':'Beer'}
//    });
//   // next();
// });

router.get('/', function(req, res, next){
  console.log('Req.query: '+req.query.query);
  var searchTerm = null;
  if ( !req.query.query && req.query.query==null ) searchTerm = 'STOUT';
  else searchTerm = req.query.query;
  elastic.search(searchTerm, function(data) {
    res.render('beers', { title: 'Express', results: data, query: searchTerm });
  });
});


// get params
// router.get('/:query', function (req, res, next) {
//   var pageNum = 1;
//   var perPage = 10;
//   var userQuery = req.params.query;
//
//   console.log('pageNum is: '+pageNum);
//   console.log('perPage is: '+perPage);
//   console.log('userQuery is: '+userQuery);
//
//   elastic.searchByParams(apivo_es.indexName, pageNum, perPage, userQuery);
//   // res.render('beers', { title: 'Beers', beers: JSON.stringify(elastic.es_data, null, 2) });
//   res.json(elastic.es_data);
//   console.log('---------------START ES_DATA---------------');
//   // console.log(JSON.stringify(elastic.es_data, null, 2));
//   console.log('---------------END ES_DATA---------------');
//
//   // res.redirect('/beers');
//   res.end();
// });



module.exports = router ;
