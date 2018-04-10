// REST services
// Require controllers
var search_controller = require('../controllers/search'),
    style_controller = require('../controllers/styles'),
    graphics_controller = require('../controllers/graphics'),
		hashload = require('../models/hashloader');

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
	let str = 'call REST service hashload';
	switch (request.parameters.id) {
		case '1':
			str += 1;
			console.log(str);
			hashload.LoadHashes();
			return { msg: str }
			break;
		case '2':
			str += 2;
			console.log(str);
			hashload.LoadHashes2();
			return { msg: str }
			break;
		default:
			return { msg: 'bad ID' }
	}
}


// router.post('/api/graphics', graphics_controller.charts); // AJAX graphics API
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
