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
  
  /*
    get data for chart1
    ajax POST XHR
   */
  var request = $.ajax({
    url:url,
    type: 'POST',
    data: JSON.stringify({ "chart": "c1" }),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json'});
  request.fail(function (err, msg) {
    $('#spinner1').remove(); // remove beer spinner
    // add Error alert
    $('#chart1').after('<div class="alert alert-danger"><strong>Error!</strong><br>Ошибка получения данных для графика 1.<br>HTTP Status: '+err.status+' '+err.statusText+'</div>');
    console.log('Request failed.\nStatus:'+err.status+'\nStatus text: '+err.statusText+'\nError message: '+msg);
  });
  request.done(function(response) {
    $('#spinner1').remove(); // remove beer spinner
    ctx1.removeClass('hidden'); // hide chart1
    console.log('response: '+JSON.stringify(response, null,2));
    // construct data for chart1
    var data = {
      datasets: [{
        data: [response.ales, response.lagers, response.hybrid],
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
    // render chart1 doughnut
    new Chart(ctx1, {
        type: 'doughnut',
        data: data,
    });
  });

  /*
    get data for chart2 (bar)
    ajax POST XHR
   */
  var request = $.ajax({
    url:url,
    type: 'POST',
    data: JSON.stringify({ "chart": "c2" }),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json'});
  request.fail(function (err, msg) {
    $('#spinner2').remove(); // remove beer spinner
    // add Error alert
    $('#chart2').after('<div class="alert alert-danger"><strong>Error!</strong><br>Ошибка получения данных для графика 2.<br>HTTP Status: '+err.status+' '+err.statusText+'</div>');
    console.log('Request failed.\nStatus:'+err.status+'\nStatus text: '+err.statusText+'\nError message: '+msg);
  });
  request.done(function(response) {
    $('#spinner2').remove(); // remove beer spinner
    ctx2.removeClass('hidden'); // hide chart2
    console.log('response: '+JSON.stringify(response, null,2));
    // construct data for chart2
    var data = {
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
    new Chart(ctx2, {
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


})
