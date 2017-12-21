var es_client = require('../libs/elasticsearch'), // require ES module
    log = require('../libs/log')(module),
    config = require('../config/config'),
    apivoModel = require('./apivoModel'), // Create Apivo schema model
    query = require('./dsl');

// List beer generator
exports.list = async (function* (style, page, size){
  const page = (page > 0 ? page : 1) - 1;
  const options = {
    limit: size,
    page: page
  }

  const beers = yield apivoModel.list(options);
  const count = yield apivoModel.count();

  const resp_json = {
    beers: beers,
    count: count,
    page: page +1,
    pages: Math.ceil(count / limit)
  }

})
