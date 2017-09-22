var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.userName = 'Anonimous';
  res.cookie('signed_token', 'omnomnom', { signed: true });
  res.render('index', { title: 'Express PUG Bootstrap' });
});

module.exports = router;
