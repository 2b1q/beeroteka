/** beers router */
var express = require('express'),
    router = express.Router();

// Require controllers
var search_controller = require('../controllers/search'),
    style_controller = require('../controllers/styles'),
    catalog_controller = require('../controllers/catalog'),
    graphics_controller = require('../controllers/graphics');

/* default '/beers' route "/" => Catalog view */
router.get('/', catalog_controller.default);
router.get('/catalog/loadhashes', catalog_controller.loadhashes); // TODO add AUTH to this route
router.get('/catalog/loadhashes2', catalog_controller.LoadHashes2); // TODO add AUTH to this route

/* Search routes */
router.get('/search', search_controller.search); // render search.pug
router.get('/search2', search_controller.search2); // render search2.pug
router.get('/api/search', search_controller.ApiGetSearch); // ajax GET ES API
router.post('/api/search', search_controller.ApiPostSearchMongo); // ajax POST API advanced beer search Mongoose

/* infographics */
router.get('/graphics', graphics_controller.show); // show graphics data

// REST API beer
// router.get('/api/', beer.list); // GET all beerMongoose API
// router.post('/api/', beer.create); // create one record
// router.get('/api/:beerId', beer.read); // get one record
// router.put('/api/:beerId', beer.update); // update one record
// router.delete('/api/:beerId', beer.delete); // delete one record

/* '/beers/styles' route. Styles controllers */
router.get('/styles', style_controller.styles);
router.get('/styles/find', style_controller.find);

module.exports = router;
