/**
* REST service endpoints
*/

// Require controllers
var catalog_controller = require('../../controllers/catalog'),
    search_controller = require('../../controllers/search');

// export REST services
exports.attach = function(rest) {
  /** test endpoint */
  // bind the service funciont to only the given http request types
  rest.assign([ 'get','post' ],                               // assign incoming HTTP REST methods
              [ { path: '/test/:wait', unprotected: true },   // path 1
                { path: '/test', unprotected: true } ],       // path 2
                test_api )   // setup assync callback service to API route
  /** dataloader endpoint */
  rest.get({ path: '/dataload/:id', unprotected: false }, dataload ); // hashload service /api/dataload/<id>?api_key=<api_key>
  /** ES search endpoint */
  rest.get({ path: '/es/:query', unprotected: true }, es_search );
  /** Mongoose search endpoint */
  rest.post({ path: '/mongo', unprotected: true }, mongo_search );
}

// test API
 async function test_api(request, content) {
  const wait = parseInt(request.parameters.wait); // parseInt return Number
  if(!wait) return { msg: 'bad query. U need to setup "wait" parametr in "ms"'}
	// console.log( 'Received headers:' + JSON.stringify( request.headers ) )
	console.log( 'Received parameters:' + JSON.stringify( request.parameters ) )
	console.log( 'Received JSON object:' + JSON.stringify( content ) )
	// return { name: 'test name', id: request.parameters.id }
  let response = await (wait => {
    return new Promise(function(resolve, reject) {
      setTimeout(function(){ resolve({msg:`hello. This is response after ${wait} ms` }); }, wait);
    });
  })(wait)
  console.log('return response object after await');
  return response;
}

// new hashload service
async function dataload(request, content) {
	console.log( 'Received parameters:' + JSON.stringify( request.parameters ) )
	if(request.parameters.id) return catalog_controller.dataload(request.parameters.id);
	else return { msg: 'unable to set ID parameter' }
}

// new ES search async await endpoint
async function es_search(request, content) {
  // console.log( 'Received parameters:' + JSON.stringify( request.parameters.query ) )
  let term = decodeURI(request.parameters.query);
  console.log(`decoded Term: "${term}"`)
  if(term) return await search_controller.ApiEsSearchRest(term);
  else return { msg: 'unable to set search parametr "query"' }
}

// new MongoDB(mongoose) search async await endpoint
async function mongo_search(request, content) {
  console.log( 'Received JSON:' + JSON.stringify( content ) )
  if(content.query) return await search_controller.ApiMongoSearchRest(content);
  else return { msg: 'unable to set "query" object' }
}



// REST API beer
// router.get('/api/', beer.list); // GET all beerMongoose API
// router.post('/api/', beer.create); // create one record
// router.get('/api/:beerId', beer.read); // get one record
// router.put('/api/:beerId', beer.update); // update one record
// router.delete('/api/:beerId', beer.delete); // delete one record
