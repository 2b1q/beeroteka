// DOM ready
$(function () {
  var url = '/beers/api/graphics'; // graphics URL API
  var ctx1 = $('#chart1'); // locate chart1
  ctx1.addClass('hidden'); // hide chart1
  ctx1.after('<img id="spinner" src="../images/spinner2.gif" width="100%" height="100%">'); // add spinner
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
    $('#spinner').remove(); // remove beer spinner
    // add Error alert
    $('#chart1').after('<div class="alert alert-danger"><strong>Error!</strong><br>Ошибка получения данных для графика 1.<br>HTTP Status: '+err.status+' '+err.statusText+'</div>');
    console.log('Request failed.\nStatus:'+err.status+'\nStatus text: '+err.statusText+'\nError message: '+msg);
  });
  request.done(function(response) {
    $('#spinner').remove(); // remove beer spinner
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
})
