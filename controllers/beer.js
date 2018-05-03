/** Beer controller
  - add/delete/lookup beer controller,
  use beer model
*/
var config = require('../config/config'),
    log = require('../libs/log')(module),
    beer_model = require('../models/beer');

// AddBeer controller
async function AddBeer(req, res) {
  if(!req.query.api_key) unauth(res, { err: 'unable to set "api_key" param' }) // check api_key param exist
  else {
    if(auth(req)) res.json({ auth: "OK", api: 'AddBeer' })
    else unauth(res, { err: 'bad "api_key"' })
  }
}

// GetBeer controller
async function GetBeer(req, res) {
  if(!req.query.id) res.json({ err: `unable to pass ID`}) // check ID param exist
  else if (!checkID(req)) res.json({ err: `bad ID`}) // check ID param
  else {
    let id = parseInt(req.query.id)
    res.json({ msg: `get beer by ID '${id}'`})
  }
}


// DeleteBeer controller
async function DeleteBeer(req, res) {
  if(!req.query.api_key) unauth(res, { err: 'unable to set "api_key" param' }) // check api_key param exist
  else if(!req.query.id) res.json({ err: `unable to pass ID`}) // check ID param exist
  else if (!checkID(req)) res.json({ err: `bad ID`}) // check ID param
  else {
    let id = parseInt(req.query.id);
    if(auth(req)) res.json({ auth: "OK", api: `DeleteBeer ID: '${id}'` }) // need await promise frome model
    else unauth(res, { err: 'bad "api_key"' })
  }
}

// UpdateBeer controller
async function UpdateBeer(req, res) {
  if(!req.query.api_key) unauth(res, { err: 'unable to set "api_key" param' }) // check api_key param exist
  else if(!req.query.id) res.json({ err: `unable to pass ID`}) // check ID param exist
  else if (!checkID(req)) res.json({ err: `bad ID`}) // check ID param
  else {
    let id = parseInt(req.query.id);
    if(auth(req)) res.json({ auth: "OK", api: `UpdateBeer ID: '${id}'` }) // need await promise frome model
    else unauth(res, { err: 'bad "api_key"' })
  }
}


// AUTH required
const unauth = (res, msg) => {
  res.status(401)
  res.json(msg)
}

// check AUTH api_key
const auth = req => config.restOptions.apiKeys.includes(req.query.api_key)

// check beer ID
const checkID = req => isNaN(parseInt(req.query.id))? false : true;


module.exports = {
  add:      AddBeer,      // add beer
  get:      GetBeer,      // get beer by ID
  delete:   DeleteBeer,   // remove beer by ID
  update:   UpdateBeer    // update beer by ID
};
