/** Search controller */
var elastic = require('../models/es_search'); // add es_search API

exports.search = function(req, res) {
  var searchTerm = req.query.query || 'STOUT';
  console.log('Req.query: '+searchTerm);

  elastic.search(searchTerm, function(data) {
    data.forEach(function(item){
      let score = item._source.score || item._source.BA_score;
      let score_percent = Math.round(score/0.05)
      item._source.score_percent = score_percent
    })
    req.flash('success', 'Your name was updated');
    // console.log('ES data: \n'+JSON.stringify(data, null, 2));
    res.render('search', { title: 'beer Search', user: req.session.username, results: data, query: searchTerm });
  });
}
