/** Search controller */
var elastic = require('../models/es_search'), // add es_search API
    config = require('../config/config');

// GET controller
exports.search = function(req, res) {
  res.render('search', { title: 'beer Search', user: req.session.username });
}

// GET Ajax API 'beers/api/search'
exports.ApiPostSearch = function (req,res) {
  var searchTerm = req.query.query || 'STOUT';
  console.log(`${config.color.cyan}Ajax HTTP GET Req.query: ${searchTerm}`);

  elastic.search(searchTerm, function(data) {
    data.forEach(function(item){
      let score = item._source.score || item._source.BA_score;
      let score_percent = Math.round(score/0.05)
      item._source.score_percent = score_percent
    })
    res.send(data);
  });

}
