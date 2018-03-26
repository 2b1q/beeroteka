// DOM ready
$(function () {
  var ctx = $('#chart1');
  var data = {
    datasets: [{
      data: [169370, 25000],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)'
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)'
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
