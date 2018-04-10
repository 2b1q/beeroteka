// REST services
// Require controllers
var search_controller = require('../controllers/search'),
    style_controller = require('../controllers/styles'),
    graphics_controller = require('../controllers/graphics'),
		catalog_controller = require('../controllers/catalog');

// test API
async function test_api(request, content) {
	console.log( 'Received headers:' + JSON.stringify( request.headers ) )
	console.log( 'Received parameters:' + JSON.stringify( request.parameters ) )
	console.log( 'Received JSON object:' + JSON.stringify( content ) )
	return { name: 'test name', id: request.parameters.id }
}

// new hashload service
async function dataload(request, content) {
	console.log( 'Received parameters:' + JSON.stringify( request.parameters ) )
	if(request.parameters.id) return catalog_controller.dataload(request.parameters.id);
	else return { msg: 'unable to set ID parameter' }
}


// TODO to Refactoring
// router.get('/api/search', search_controller.ApiGetSearch); // ajax GET ES API
// router.post('/api/search', search_controller.ApiPostSearchMongo); // ajax POST API advanced beer search Mongoose
/* infographics */
// router.get('/graphics', graphics_controller.show); // show graphics data
// router.post('/api/graphics', graphics_controller.charts); // AJAX graphics old API


// REST API beer
// router.get('/api/', beer.list); // GET all beerMongoose API
// router.post('/api/', beer.create); // create one record
// router.get('/api/:beerId', beer.read); // get one record
// router.put('/api/:beerId', beer.update); // update one record
// router.delete('/api/:beerId', beer.delete); // delete one record

module.exports = {
	test_service:	test_api, // test API
	dataload: dataload // new hashload API service
}
