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
get data for chart1 (Ales)
from MongoDB baModel collection
and return Promise with data
*/
function alesMongo() {
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
      $group: { _id: null, count: {$sum: 1} }
      // $group: { _id: '$ba_style', count: {$sum: 1} }
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
get data for chart1 (Lagers)
from MongoDB baModel collection
and return Promise with data
*/
function lagersMongo() {
  var pattern =
  [
    {
      $match: {
        $or: [
          { ba_style: /lager/ig },
          { ba_style: /pils/ig },
          { ba_style: /bock/ig },
          { ba_category: /lager/ig },
          { ba_category: /bock/ig },
          { ba_category: /pils/ig }
        ]
      }
    },
    {
      $group: { _id: null, count: {$sum: 1} }
      // $group: { _id: '$ba_style', count: {$sum: 1} }
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
get data for chart1 (Hybrid)
from MongoDB baModel collection
and return Promise with data
*/
function hybridMongo() {
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
          { ba_style: /bock/ig },
          { ba_style: /pils/ig },
          { ba_category: /Hybrid/ig },
          { ba_category: /Vegetable/ig },
          { ba_category: /fruit/ig },
          { ba_category: /Herbed/ig },
          { ba_category: /Spiced/ig },
          { ba_category: /smoked/ig },
          { ba_category: /bock/ig },
          { ba_category: /pils/ig }
        ]
      }
    },
    {
      $group: { _id: null, count: {$sum: 1} }
      // $group: { _id: '$ba_style', count: {$sum: 1} }
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
  var p1 = alesMongo(),
      p2 = lagersMongo(),
      p3 = hybridMongo(),
      p4 = allStylesES();
  Promise.all([ p1, p2, p3, p4 ])
    .then(charts => {
      res.json({
        c1: charts[0], // chart1 data
        c2: charts[1], // chart2 data
        c3: charts[2], // chart3 data
        c3: charts[3] // chart3 data
      });
    })
}

// build charts AJAX
exports.charts = function (req, res) {
  // check AJAX GET request HAS 'chart' param
  if(!req.body.hasOwnProperty('chart')) {
    log.error(`${config.color.red}Bad query: ${JSON.stringify(req.body,null,2)}`);
    res.status(500).json({ error: 'bad query' });
  } else {
    log.info(`${config.color.cyan}\nAjax HTTP GET Req.body: ${JSON.stringify(req.body,null,2)}`);
    let chart = req.body.chart || 'all'; // get chart param. default => 'all'
    switch (chart) {
      case 'c1':
        alesMongo().then( result => {
          res.json(result)
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