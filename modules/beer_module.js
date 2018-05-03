/** Beer module
  - add/remove/lookup beer object
*/
var elastic = require('../models/es_search'), // add es_search API
    config = require('../config/config'),
    log = require('../libs/log')(module),
    _ = require('lodash'),
    apivoModel = require('../models/apivoModel'),
    baModel = require('../models/baModel');
