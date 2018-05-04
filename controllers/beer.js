/** Beer controller
  - CRUD beer controller
  - REST API using express middleware
  - request logger => singleton pattern
  - async await Promise for waiting long Ops. from model
  - user data check_module => module pattern
*/
var config = require('../config/config'),
    log = require('../libs/log')(module);

// AddBeer controller
async function AddBeer(req, res) {
  write.log(req); // write request to log
  if(check_module.auth(req.query.api_key, res))
    // exec await Promise AddBeer here => return ID
    res.json({ auth: "OK", api: 'AddBeer' })
}

// GetBeer controller
async function GetBeer(req, res) {
  write.log(req);
  if(check_module.chekid(req.query.id, res))
    // exec await Promise GetBeer here => return beer data
    res.json({ msg: `get beer by ID '${check_module.getid()}'`})
}


// DeleteBeer controller
async function DeleteBeer(req, res) {
  write.log(req);
  if(check_module.auth(req.query.api_key, res))
    if(check_module.chekid(req.query.id, res))
      // exec await Promise DeleteBeer here => return status
      res.json({ auth: 'OK', msg: `Delete beer by ID '${check_module.getid()}'`})
}

// UpdateBeer controller
async function UpdateBeer(req, res) {
  write.log(req);
  if(check_module.auth(req.query.api_key, res))
    if(check_module.chekid(req.query.id, res))
      // exec await Promise UpdateBeer here => return updated beer data
      res.json({ auth: 'OK', msg: `Update beer by ID '${check_module.getid()}'`})
}

// check module with closures
var check_module = (function() {
  // private data
  let private_id;
  // private functions
  let send_response = function(res, msg, status) {
    res.status(status);
    res.json(msg)
  };
  // check ID is number
  let checkid = id => isNaN(parseInt(id))? false : true;
  // check IF token exist
  let chek_token = token => config.restOptions.apiKeys.includes(token);
  // public interface
  return {
    chekid: function(id, res) {
      if(!id) send_response(res, { err: 'unable to pass ID'}, 200)
      else if(!checkid(id)) send_response(res, { err: 'bad ID'}, 500)
      else {
        private_id = parseInt(id);
        return true
      }
    },
    getid: () => private_id,
    auth: function(api_key, res) {
      if(!api_key) send_response(res, { err: 'unable to set "api_key" param' }, 401)
      else if(!chek_token(api_key)) send_response(res, { err: 'bad "api_key"' }, 401)
      else return true
    }
  }
})();

// logger singleton
var logger = (function(){
  var instance; // keep reference to singleton
  function initInstance(){
    // private method
    function logit(req) {
      log.info({
        method: req.method,
        url:    req.url,
        ip:     req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        ua:     req.headers['user-agent']
      })
    }
    return {
      // public method log()
      log: req => logit(req)
    }
  }

  return {
    getInstance: function() {
      if(!instance) {
        instance = initInstance();
      }
      return instance;
    }
  }
})();

// init singleton instance (always refer to same one instance)
var write = logger.getInstance();

module.exports = {
  add:      AddBeer,      // POST   => add beer
  get:      GetBeer,      // GET    => get beer by ID
  delete:   DeleteBeer,   // DELETE => remove beer by ID
  update:   UpdateBeer    // PUT    => update beer by ID
};
