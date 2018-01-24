var express = require('express'),
    router = express.Router();

// Require controllers
var beers_controller = require('../controllers/beers')
    style_controller = require('../controllers/styles');

/** default '/beers' route "/" => Catalog view */
router.get('/', beers_controller.default);
router.get('/search', beers_controller.search);
router.get('/loadhashes', beers_controller.loadhashes);
/** '/beers/styles' route. Styles controllers */
router.get('/styles', style_controller.styles);

module.exports = router;
