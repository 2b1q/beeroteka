/** beers router */
var express = require('express'),
    router = express.Router();

// Require controllers
var search_controller = require('../controllers/search'),
    style_controller = require('../controllers/styles'),
    catalog_controller = require('../controllers/catalog'),
    graphics_controller = require('../controllers/graphics'),
    beer_controller = require('../controllers/beer');

/* default '/beers' route "/" => Catalog view */
router.get('/', catalog_controller.default);

/* Search routes */
router.get('/search', search_controller.search); // render search.pug
router.get('/search2', search_controller.search2); // render search2.pug
// router.get('/api/search', search_controller.ApiGetSearch); // ajax GET ES API (old route)
// router.post('/api/search', search_controller.ApiPostSearchMongo); // ajax POST API advanced beer search Mongoose (old route)

/* infographics */
router.get('/graphics', graphics_controller.show); // show graphics data
router.post('/api/graphics', graphics_controller.charts); // AJAX graphics old API

/* '/beers/styles' route. Styles controllers */
router.get('/styles', style_controller.styles);
router.get('/styles/find', style_controller.find);

/* beer api. Express middleware */
router.post('/api',    beer_controller.add);
router.get('/api', beer_controller.get);
router.put('/api',     beer_controller.update);
router.delete('/api',  beer_controller.delete);

module.exports = router;
