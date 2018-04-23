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
  if(!req.query.api_key) {
    res.status(401)
    res.json('unable to set "api_key" param')
  }
  // check auth key
  const auth = config.restOptions.apiKeys
  .some(key => {
    if(req.query.api_key === key) return true
  })

  console.log(`AUTH is ${auth}`);
  if(auth) res.json({ auth: "OK" })
  else {
    res.status(401)
    res.json({ err: 'bad "api_key" '})
  }
})

module.exports = router;
