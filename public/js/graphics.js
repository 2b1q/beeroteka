"use strict";
// DOM ready
$(function () {
  var url = '/beers/api/graphics'; // graphics URL API
  // chart1 on DOM loaded
  var ctx1 = $('#chart1'); // locate chart1
  ctx1.addClass('hidden'); // hide chart1
  ctx1.after('<img id="spinner1" src="../images/spinner2.gif" width="100%" height="100%">'); // add spinner
  // chart2 on DOM loaded
  var ctx2 = $('#chart2'); // locate chart2
  ctx2.addClass('hidden'); // hide chart2
  ctx2.after('<img id="spinner2" src="../images/spinner2.gif" width="100%" height="100%">'); // add spinner
  // chart3 on DOM loaded
  var ctx3 = $('#chart3'); // locate chart3
  ctx3.addClass('hidden'); // hide chart3
  ctx3.after('<img id="spinner3" src="../images/spinner2.gif" width="50%" height="50%">'); // add spinner

  /*
    get data for chart1 & chart2
    ajax POST XHR
   */
  var request = $.ajax({
    url:url,
    type: 'POST',
    data: JSON.stringify({ "chart": "c2" }),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json'});
  request.fail(function (err, msg) {
    $('#spinner1').remove(); // remove beer spinner
    $('#spinner2').remove(); // remove beer spinner
    // add Error alert
    $('#chart1').after('<div class="alert alert-danger"><strong>Error!</strong><br>Ошибка получения данных для графика 1 .<br>HTTP Status: '+err.status+' '+err.statusText+'</div>');
    $('#chart2').after('<div class="alert alert-danger"><strong>Error!</strong><br>Ошибка получения данных для графика 2.<br>HTTP Status: '+err.status+' '+err.statusText+'</div>');
    console.log('Request failed.\nStatus:'+err.status+'\nStatus text: '+err.statusText+'\nError message: '+msg);
    // add Error alert
  });
  request.done(function(response) {
    $('#spinner1').remove(); // remove beer spinner
    $('#spinner2').remove(); // remove beer spinner
    console.log('Chart 1 and 2 response: '+JSON.stringify(response, null,2));
    // if no data => add info alert
    if( response.ales.length === 0 ||
        response.lagers.length === 0 ||
        response.hybrid.length === 0)
    {
      // add info alert
      $('#chart1').after('<div class="alert alert-info">Не достаточно данных для построения графика 1.</div>');
      $('#chart2').after('<div class="alert alert-info">Не достаточно данных для построения графика 2.</div>');
    }
    else
    {
      ctx1.removeClass('hidden'); // unhide chart1
      ctx2.removeClass('hidden'); // unhide chart2
      // construct data for chart1
      var data1 = {
        datasets: [{
          data: [response.ales[0].count, response.lagers[0].count, response.hybrid[0].count],
          backgroundColor: [
            'rgba(204,102,0,1)',
            'rgba(255,230,153,1)',
            'rgba(221,153,255,1)'
          ],
          borderColor: [
            'rgba(255,255,255,1)',
            'rgba(255,255,255,1)',
            'rgba(255,255,255,1)'
          ],
          borderWidth: 6
        }],
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [ 'Ales' , 'Lagers', 'Hybrid' ]
      };
      // construct data for chart2
      var data2 = {
        datasets: [{
          data: [response.ales[0].max_abv, response.lagers[0].max_abv, response.hybrid[0].max_abv],
          label: 'max ABV.',
          backgroundColor: [
            'rgba(204,102,0,1)',
            'rgba(255,230,153,1)',
            'rgba(221,153,255,1)'
          ],
          borderColor: [
            'rgba(255,255,255,1)',
            'rgba(255,255,255,1)',
            'rgba(255,255,255,1)'
          ]
        }],
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [ 'Ales' , 'Lagers', 'Hybrid' ]
      };

      // render chart1 doughnut
      new Chart(ctx1, {
          type: 'doughnut',
          data: data1,
      });
      // render chart2 bar
      new Chart(ctx2, {
          type: 'bar',
          data: data2,
          options: {
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
      });
    }
  });

  /*
    get data for chart3 (bar)
    ajax POST XHR
   */
  var request = $.ajax({
    url:url,
    type: 'POST',
    data: JSON.stringify({ "chart": "c3" }),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json'});
  request.fail(function (err, msg) {
    $('#spinner3').remove(); // remove beer spinner
    // add Error alert
    $('#chart3').after('<div class="alert alert-danger"><strong>Error!</strong><br>Ошибка получения данных для графика 3.<br>HTTP Status: '+err.status+' '+err.statusText+'</div>');
    console.log('Request failed.\nStatus:'+err.status+'\nStatus text: '+err.statusText+'\nError message: '+msg);
  });
  request.done(function(response) {
    $('#spinner3').remove(); // remove beer spinner
    // console.log('Chart 3 response: '+JSON.stringify(response, null,2));
    ctx3.removeClass('hidden'); // unhide chart3
    var colorArr = new Array(response[0].length).fill(1);
    // fill RGBA colors
    colorArr = colorArr.map(function () {
      return random_rgba()
    });

      // construct data for chart3
      var data = {
        datasets: [{
          data: response[2],
          label: 'max ABV.',
          backgroundColor: colorArr,
          // backgroundColor: colorArr,
          borderWidth: 0
        }],
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: response[0]
      };
      // render chart2 bar
      new Chart(ctx3, {
          type: 'bar',
          data: data,
          options: {
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
      });
  });

  // set random RGBA color
  function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + 1 + ')';
  }


//   // d3 svg canvas chart 4
//   var svg = d3.select('#chart4'),
//             width = +svg.attr("width"),
//             height = +svg.attr("height"),
//             g = svg.append("g").attr("transform", "translate(20,0)");
//
//   // Setting up a way to handle the data
//   var tree = d3.cluster()                 // This D3 API method setup the Dendrogram datum position.
//             .size([height, width - 460])    // Total width - bar chart width = Dendrogram chart width
//             .separation(function separate(a, b) {
//                   return a.parent == b.parent            // 2 levels tree grouping for category
//                   || a.parent.parent == b.parent
//                   || a.parent == b.parent.parent ? 0.4 : 0.8;
//             });
//
// //
// var d3data = {
//   name: 'beer',
//   children: [
//     {
//       name: 'ale styles',
//       children: [
//         { name: 'Quadrupel (Quad)' },
//         { name: 'Quadrupel (Quad)' },
//         { name: 'Quadrupel (Quad)' }
//       ]
//     },
//     {
//       name: 'lager styles',
//       children: [
//         { name: 'Quadrupel (Quad)' },
//         { name: 'Quadrupel (Quad)' },
//         { name: 'Quadrupel (Quad)' }
//       ]
//     },
//     {
//       name: 'hybrid styles',
//       children: [
//         { name: 'Quadrupel (Quad)' },
//         { name: 'Quadrupel (Quad)' },
//         { name: 'Quadrupel (Quad)' }
//       ]
//     }
//   ]
// }



})
