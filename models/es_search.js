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

// ES bool search with callback
module.exports.search = function(searchData, callback) {
  console.log('searchData params: '+JSON.stringify(searchData, null, 2));
  es_client.client.search({
    index: 'resultdb',
    type: 'beeradvocate',
    // type: 'apivo',
    body: {
      query: {
        bool: {
          must: {
            match: {
              // 'result': searchData.searchTerm
              'result': searchData
            }
          }
        }
      }
    }
  }).then(function (resp) {
    // console.log('ES data: \n'+resp.hits.hits[0]._source.result);
    callback(resp.hits.hits);
  }, function (err) {
      callback(err.message)
      console.log(err.message);
  });
}
