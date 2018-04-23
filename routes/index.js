var express = require('express'),
    router = express.Router(),
    config = require('../config/config');

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.username = 'Anonimous'; // set user session object
  res.cookie('signed_token', 'omnomnom', { signed: true });
  // req.flash('notify', 'This is a test notification.')
  res.render('index', { title: 'Express Beer agregator' });
});

// test REST route with api_key using OOTB middleware
router.get('/test',(req, res, next) => {
  if(!req.query.api_key) unauth(res, { err: 'unable to set "api_key" param' })
  else {
    if(auth(req)) res.json({ auth: "OK" })
    else unauth(res, { err: 'bad "api_key"' })
  }
})

// AUTH required
const unauth = (res, msg) => {
  res.status(401)
  res.json(msg)
}

// check AUTH api_key
const auth = req => {
  return config.restOptions.apiKeys
  .some(key => {
    if(req.query.api_key === key) return true
  })
}

module.exports = router;
