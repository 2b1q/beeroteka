/** Beer model
  - add/delete/lookup beer model,
  use beer module to work with beer data directly,
*/
const elastic     = require('../models/es_search'),
      apivoModel  = require('./apivoModel'),
      baModel     = require('./baModel'),
      config      = require('../config/config'),
      log         = require('../libs/log')(module);

// beer constructor
function Beer(beer_object) {
  this.beer     = beer_object.beer  || '';
  this.brew     = beer_object.brew  || '';
  this.style    = beer_object.style || '';
  this.abv      = beer_object.abv;
  this.country  = beer_object.country;
  this.vol      = beer_object.vol;
  this.desc     = beer_object.desc  || '';
  this.img      = beer_object.img;
  this.taste    = beer_object.taste || '';
  this.type     = beer_object.type  || '';
  this.price    = beer_object.price;
  this.score    = beer_object.score;
}


// beer module
const beer_module = (function(){
  // private functions
  const add_beer = beer_data => {
    const beer = new Beer(beer_data);
    return new Promise(function(resolve, reject) {
      // save beer to mongo then
      resolve({ beer_id: '' })
    });
  };
  const upd_beer = (id, beer_data) => {
    const beer = new Beer(beer_data);
    return new Promise(function(resolve, reject) {
      // upd beer by ID
      resolve({ beer_id: '' })
    });
  };
  const del_beer = id => {
    return new Promise(function(resolve, reject) {
      // del beer by ID
    });
  };
  const get_beer = id => {
    return new Promise(function(resolve, reject) {
      // get beer by ID
      baModel.findOne({_id: id }, (err, data) => {
        if(!data) {
          apivoModel.findOne({_id: id }, (err, data) => {
            if(!data) resolve({ msg: `beer not found by ID '${id}'` })
            else resolve(data) // resolve with data from apivoModel
          })
        } else resolve(data) // resolve with data from baModel
      });
      // apivomodels > 5accdd989bdbfd7278867637
      // db.bamodels.find({}).pretty() 5a95830b3470bc218db2d004
    });
  }
  // public interfaces
  return {
    add: beer_data        => add_beer(beer_data),
    upd: (id, beer_data)  => upd_beer(id, beer_data),
    del: id               => del_beer(id),
    get: id               => get_beer(id)
  }
})();


module.exports = {
  add:   beer_module.add,
  get:   beer_module.get,
  del:   beer_module.del,
  upd:   beer_module.upd
};
