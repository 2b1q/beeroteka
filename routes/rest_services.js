/**
* REST service endpoints
*/

// Require controllers
var search_controller = require('../controllers/search'),
    style_controller = require('../controllers/styles'),
    graphics_controller = require('../controllers/graphics'),
		catalog_controller = require('../controllers/catalog');

// export REST services
exports.attach = function(rest) {
  /** test endpoint */
  // bind the service funciont to only the given http request types
  rest.assign([ 'get','post' ], // assign incoming HTTP REST methods
              [ { path: '/test', unprotected: true } ], // config API route
              test_api ) // setup assync callback service to API route
  /** dataloader endpoint */
  rest.get({ path: '/dataload/:id', unprotected: false }, dataload ); // hashload service /api/dataload/<id>?api_key=<api_key>
  rest.get({ path: '/es/:term', unprotected: true }, async function (req, content) {
    return { msg 'ok'}
  } );
}

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

// new ES search service
async function es_search(request, content) {
  console.log( 'Received parameters:' + JSON.stringify( request.parameters ) )
  // var searchTerm = request.parameters.term || 'STOUT';
  // console.log(`${config.color.cyan}REST API query term: ${searchTerm}`);
  // return search_controller.ApiEsSearch(searchTerm);
  return { msg: 'ok' }
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
