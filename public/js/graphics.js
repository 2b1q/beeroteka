// DOM ready
$(function () {
  var ctx = $('#chart1');
  var data = {
    datasets: [{
      data: [169370, 25000],
      backgroundColor: [
        'rgba(204, 102, 0, 1)',
        'rgba(255, 179, 26, 1)'
      ],
      borderColor: [
        'rgba(0, 0, 0, 1)',
        'rgba(0,0,0,0,1)'
      ],
      borderWidth: 1
    }],
    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [ 'Ales' , 'Lagers' ]
  };
  var myChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
  });
})
