/** Graphics controller */
var elastic = require('../models/es_search'), // add es_search API
    config = require('../config/config'),
    log = require('../libs/log')(module),
    _ = require('lodash'),
    apivoModel = require('../models/apivoModel'),
    baModel = require('../models/baModel');

// render infographics view
exports.show = function (req, res) {
  // render infographics
  res.render('infographics', { title: 'Пиво в цифрах' });
}

/*
get data for chart1 and chart2 (Ales)
from MongoDB baModel collection
and return Promise with data
*/
function alesMongo(cnt) {
  // var field = (cnt => cnt ? null : '$ba_style')(cnt); AF + IIFE + args
  var pattern =
  [
    {
      $match: {
        $or: [
          { ba_style: /ale/ig },
          { ba_style: /apa/ig },
          { ba_style: /ipa/ig },
          { ba_style: /stout/ig },
          { ba_category: /ales/ig }
        ]
      }
    },
    {
      $group: {
        _id: (cnt => cnt ? null : '$ba_style')(cnt),
        count: {$sum: 1}, // if cnt = true then _id: null esle _id: '$ba_style'
        max_abv: { $max: '$ba_abv' },
        min_abv: { $min: '$ba_abv' }
       }
      // $group: { _id: '$ba_style', count: {$sum: 1} } // group by ba_style count
    }
  ];
  return new Promise(function(resolve, reject) {
    baModel
    .aggregate(pattern)
    .exec((err, data) => {
      if(err) reject(err);
      resolve(data);
    })
  });
}

/*
get data for chart1 and chart2 (Lagers)
from MongoDB baModel collection
and return Promise with data
*/
function lagersMongo(cnt) {
  var pattern =
  [
    {
      $match: {
        $or: [
          { ba_style: /lager/ig },
          { ba_style: /pils/ig },
          { ba_category: /lager/ig },
          { ba_category: /pils/ig }
        ]
      }
    },
    {
      $group: {
        _id: (cnt => cnt ? null : '$ba_style')(cnt),
        count: {$sum: 1}, // if cnt = true then _id: null esle _id: '$ba_style'
        max_abv: { $max: '$ba_abv' },
        min_abv: { $min: '$ba_abv' }
       }
      // $group: { _id: '$ba_style', count: {$sum: 1} } // group by ba_style count
    }
  ];
  return new Promise(function(resolve, reject) {
    baModel
    .aggregate(pattern)
    .exec((err, data) => {
      if(err) reject(err);
      resolve(data);
    })
  });
}

/*
get data for chart1 and chart2 (Hybrid)
from MongoDB baModel collection
and return Promise with data
*/
function hybridMongo(cnt) {
  var pattern =
  [
    {
      $match: {
        $or: [
          { ba_style: /Hybrid/ig },
          { ba_style: /Vegetable/ig },
          { ba_style: /fruit/ig },
          { ba_style: /Herbed/ig },
          { ba_style: /Spiced/ig },
          { ba_style: /smoked/ig },
          { ba_category: /Hybrid/ig },
          { ba_category: /Vegetable/ig },
          { ba_category: /fruit/ig },
          { ba_category: /Herbed/ig },
          { ba_category: /Spiced/ig },
          { ba_category: /smoked/ig }
        ]
      }
    },
    {
      $group: {
        _id: (cnt => cnt ? null : '$ba_style')(cnt), // if cnt = true then _id: null esle _id: '$ba_style'
        count: {$sum: 1},
        max_abv: { $max: '$ba_abv' },
        min_abv: { $min: '$ba_abv' }
       }
      // $group: { _id: null, count: {$sum: 1} }
      // $group: { _id: '$ba_style', count: {$sum: 1} } // group by ba_style count
    }
  ];
  return new Promise(function(resolve, reject) {
    baModel
    .aggregate(pattern)
    .exec((err, data) => {
      if(err) reject(err);
      resolve(data);
    })
  });
}

/*
get data for chart3 (abv, count by styles)
from MongoDB baModel collection
and return Promise with arr [[],[],[]]
*/
function StylesMongo() {
  var pattern =
  [
    {
      $group: {
        _id: '$ba_style',
        count: {$sum: 1},
        max_abv: { $max: '$ba_abv' }
      }
    }
  ];
  return new Promise(function(resolve, reject) {
    baModel
    .aggregate(pattern)
    .exec((err, response) => {
      if(err) reject(err);
      // transform response array
      // map array.key.objects to new arrays
      // & concat Arr1 & Arr2 & Arr3 to [[],[],[]]
      resolve( _.concat(
        [response.map( key => key._id)],
        [response.map( key => key.count)],
        [response.map( key => key.max_abv)]
      ))
    })
  });
}

/*
get data for chart1 (Ales vs Lagers)
from ES ba index
and return Promise with data
*/
function allStylesES() {
  return new Promise(function(resolve, reject) {
    elastic.getAllStyles(styles => {
      resolve(styles)
    })
  })
}


// AllCharts
function AllCharts(res) {
  var p1 = alesMongo(false),
      p2 = lagersMongo(false),
      p3 = hybridMongo(false),
      p4 = allStylesES();
  Promise.all([ p1, p2, p3, p4 ])
    .then(charts => {
      res.json({
        c1: charts[0], // chart1 data
        c2: charts[1], // chart2 data
        c3: charts[2], // chart3 data
        c4: charts[3] // chart3 data
      });
    })
}

// build charts AJAX
exports.charts = function (req, res) {
  let cnt = true; // if cnt = true then return only CNT for all styles
  // check AJAX GET request HAS 'chart' param
  if(!req.body.hasOwnProperty('chart')) {
    log.error(`${config.color.red}Bad query: ${JSON.stringify(req.body,null,2)}`);
    res.status(500).json({ error: 'bad query' });
  } else {
    log.info(`${config.color.cyan}\nAjax HTTP GET Req.body: ${JSON.stringify(req.body,null,2)}`);
    let chart = req.body.chart || 'all'; // get chart param. default => 'all'
    switch (chart) {
      case 'c1': // Ales, Lager, Hybrid from MongoDB baModel collection
        Promise.all([
          alesMongo(cnt), // get Ales count
          lagersMongo(cnt), // get Lager count
          hybridMongo(cnt) // get Hybrid count
        ])
        .then(data => {
          let json_resp = {
            // IIFE + AF + ternary (if obj has count property => return property else return 0)
            ales: (obj => _.has(obj, 'count') ? obj.count : 0)(data[0][0]),
            lagers: (obj => _.has(obj, 'count') ? obj.count : 0)(data[1][0]),
            hybrid: (obj => _.has(obj, 'count') ? obj.count : 0)(data[2][0])
            // ales: data[0][0].count,
            // lagers: data[1][0].count,
            // hybrid: data[2][0].count
          }
          res.json(json_resp)
        })
        .catch(reason => {
          log.error(reason);
          res.status(500).json({ error: reason });
        })
        break;
      case 'c2':
        Promise.all([
          alesMongo(cnt), // get Ales count
          lagersMongo(cnt), // get Lager count
          hybridMongo(cnt) // get Hybrid count
        ])
        .then(data => {
          let json_resp = {
            ales:   data[0],
            lagers: data[1],
            hybrid: data[2]
          }
          res.json(json_resp)
        })
        .catch(reason => {
          log.error(reason);
          res.status(500).json({ error: reason });
        })
        break;
      case 'c3':
        StylesMongo().then(data => {
          res.json(data);
        })
      break;
      case 'all':
        AllCharts(res);
        break;
      default:
        // if chart name 'unknown'
        res.status(404).json({ error: 'chart not found' });
    }
  }
}
