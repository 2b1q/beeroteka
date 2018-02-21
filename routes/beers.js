/** beers router */
var express = require('express'),
    router = express.Router();

// Require controllers
var search_controller = require('../controllers/search'),
    style_controller = require('../controllers/styles'),
    catalog_controller = require('../controllers/catalog');

/* default '/beers' route "/" => Catalog view */
router.get('/', catalog_controller.default);
router.get('/catalog/loadhashes', catalog_controller.loadhashes); // TODO add AUTH to this route
router.get('/catalog/loadhashes2', catalog_controller.LoadHashes2); // TODO add AUTH to this route

/* Catalog routes */
router.get('/search', search_controller.search); // render search.pug
router.get('/api/search', search_controller.ApiPostSearch); // ajax GET API

/* '/beers/styles' route. Styles controllers */
router.get('/styles', style_controller.styles);
// router.get('/styles/ales', style_controller.ales);
router.get('/styles/find', style_controller.find);

module.exports = router;
