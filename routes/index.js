var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.username = 'Anonimous'; // set user session object
  res.cookie('signed_token', 'omnomnom', { signed: true });
  // req.flash('notify', 'This is a test notification.')
  res.render('index', { title: 'Express Beer agregator' });
});

module.exports = router;
