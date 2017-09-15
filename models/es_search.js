/**
ES Search model
*/
var es_client = require('../lib/elasticsearch'); // require ES module
// Search behavior
function searchByParams(indexName, pageNum, perPage, userQuery){
  // setup query params
  var searchParams = {
    index: indexName,
    from: (pageNum - 1) * perPage,
    size: perPage,
    body: {
      query: {
        match: {
          result: userQuery
        }
      }
    }
  };

  es_client.client.search(searchParams, function (err, resp, status) {
    // handle error
    if (err) console.trace(err.message);
    console.log('Response status: '+ status);
    exports.es_data = resp; // export ES result
    // console.log(JSON.stringify(resp, null, 2));
    // return resp;
  });
}
exports.searchByParams = searchByParams;
