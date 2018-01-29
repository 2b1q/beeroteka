var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Define a schema
var Schema = mongoose.Schema;

// BeerAdvocate enriched by Apivo data
var baSchema = new Schema({
  ap_beer:             { type: String, required: true }, // Apivo beer name without substr @brewary
  ap_orig_beer_name:   String, // Apivo original beer name with @brewary
  ap_brewary:          String, // Apivo brewary
  ap_style:            String, // eg "ap_style":"Red Ale - American Amber / Red",
  ap_country:          String, // eg "ap_country":"США",
  ap_abv:              Number, // (type => Double) eg "ap_abv":5.8,
  ap_vol:              String, // eg "ap_vol":"0.355 л",
  ap_density:          Number, // (type => Double) "" OR float
  ap_tara:             String, // eg "ap_tara":"Бут. стекл.",
  ap_type:             String, // eg "ap_type":"Верховое (Эль)"
  ap_price_str:        String, // eg "ap_price_str":"229 руб"
  ap_price_num:        Number, // eg "ap_price_num":229
  ap_composition:      String, // "" OR String
  ap_url:              String, // String
  ap_img:              String, // ap_img URL String
  ap_taste:            String, // "" OR String
  ap_desc:             {
    "0":               String,
    "1":               String,
    "2":               String,
    "3":               String,
    "4":               String
  }, // String (in real {} OR obj)
  approved:            { type: Boolean, default: false }, // IF ap_data EQUAL to ba_date => set to true
  updated:             { type: Date, default: Date.now },
  country_obj: {
    name:              String,  // eg. "name":"United States"
    code:              String,  // eg. "code":"USA"
    emoji:             String,  // eg. "emoji":"🇺🇸"
    currencies:        [String]        // eg. "currencies":["USD"]
  }, //"country_obj":{"name":"United States","code":"USA","emoji":"🇺🇸","currencies":["USD"]},
  ba_score:            Number, // (type => Double) BeerAdvocate (ba1 index DSL 'ba_bool_query_string' search query _score) eg, "score":3.85,
  ba_beer_score:       Number, // Beer BA Score,
  ba_img:              String, // "img":null,
  ba_title:            String, // "title":"Wee Heavy Scotch Ale | Brouwerij Kees | BeerAdvocate",
  ba_url:              String, //"https://www.beeradvocate.com/beer/profile/39015/204826/",
  ba_ratings:          Number, // "Ratings":10,
  ba_reviews:          Number, // "Reviews":4,
  ba_abv:              Number, // (type => Double) eg "abv":9.5,
  ba_brewary:          String, // "Jolly Pumpkin"
  ba_beer:             String, // eg. "beer":"Wee Heavy Scotch Ale"
  ba_style:            String, // "Scotch Ale / Wee Heavy",
  ba_category:         String // eg. "category":"Irish Ales",
});

module.exports = mongoose.model('baModel', baSchema );
