/** Beer controller
  - add/delete/lookup beer controller,
  use beer model
*/
var config = require('../config/config'),
    log = require('../libs/log')(module),
    beer_model = require('../models/beer');

// AddBeer controller
async function AddBeer(req, res) {
  if(check_module.auth(req.query.api_key, res)) res.json({ auth: "OK", api: 'AddBeer' })
}

// GetBeer controller
async function GetBeer(req, res) {
  if(check_module.chekid(req.query.id, res)) res.json({ msg: `get beer by ID '${check_module.getid()}'`})
  // exec API here
}


// DeleteBeer controller
async function DeleteBeer(req, res) {
  if(check_module.auth(req.query.api_key, res))
    if(check_module.chekid(req.query.id, res))
      res.json({ auth: 'OK', msg: `Delete beer by ID '${check_module.getid()}'`})
}

// UpdateBeer controller
async function UpdateBeer(req, res) {
  if(check_module.auth(req.query.api_key, res))
    if(check_module.chekid(req.query.id, res))
      res.json({ auth: 'OK', msg: `Update beer by ID '${check_module.getid()}'`})
}

// check module with closures
var check_module = (function () {
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
}());



module.exports = {
  add:      AddBeer,      // add beer
  get:      GetBeer,      // get beer by ID
  delete:   DeleteBeer,   // remove beer by ID
  update:   UpdateBeer    // update beer by ID
};
