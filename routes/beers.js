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
router.get('/catalog/LoadChunks', catalog_controller.LoadChunks); // TODO add AUTH to this route

/* Catalog routes */
router.get('/search', search_controller.search);

/* '/beers/styles' route. Styles controllers */
router.get('/styles', style_controller.styles);
router.get('/styles/ales', style_controller.ales);
router.get('/styles/find', style_controller.find);

module.exports = router;
