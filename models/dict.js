var countries        = require('country-data').countries,
    currencies       = require('country-data').currencies,
    regions          = require('country-data').regions,
    languages        = require('country-data').languages,
    callingCountries = require('country-data').callingCountries;

var lookup = require('country-data').lookup;

let rus_dict = {
  "бельгия": "Belgium",
  "сша": "United States",
  "франция": "France",
  "россия": "Russian Federation",
  "дания": "Denmark",
  "англия": "England",
  "германия": "Germany",
  "голландия": "Netherlands",
  "шотландия": "Scotland",
  "италия": "Italy",
  "норвегия": "Norway",
  "швеция": "Sweden",
  "эстония": "Estonia",
  "ирландия": "Ireland",
  "испания": "Spain",
  "швейцария": "Switzerland",
  "австрия": "Austria",
  "чехия": "Czech Republic",
  "армения": "Armenia",
  "мексика": "Mexico",
  "япония": "Japan"
}

// Get country obj {} bu rus country name
var getCountry = function(rus_name){
  var country_obj = {};
  let eng_name = rus_dict[rus_name.toLowerCase()];
  let country = lookup.countries({name: eng_name})[0],
      iso = "",
      country_name = "",
      emoji = "",
      currencies = "";
  if(country!== undefined){
    iso = country.alpha3;
    country_name = country.name;
    emoji = country.emoji;
    currencies = country.currencies;
  } else {
    country_name = eng_name;
    if(eng_name === 'England') iso = "ENG";
    if(eng_name === 'Scotland') iso = "SCT";
  }
  country_obj.name = country_name;
  country_obj.code = iso;
  country_obj.emoji = emoji;
  country_obj.currencies = currencies;
  return country_obj;
}

// console.log(JSON.stringify(getCountry('Швеция')));
// for(let RusCountry in rus_dict) {
//   let eng_name = rus_dict[RusCountry];
//   let country = lookup.countries({name: eng_name})[0],
//       iso = "",
//       country_name = "",
//       emoji = "",
//       currencies = "";
//   if(country!== undefined){
//     iso = country.alpha3;
//     country_name = country.name;
//     emoji = country.emoji;
//     currencies = country.currencies;
//   } else {
//     country_name = eng_name;
//     if(eng_name === 'England') iso = "ENG";
//     if(eng_name === 'Scotland') iso = "SCT";
//   }
//   console.log(`-----------
// country_nam: "${country_name}"
// country_code: "${iso}"
// emoji: "${emoji}"
// currencies: ${currencies}`);
// }

module.exports = {
  getCountry: getCountry
}
