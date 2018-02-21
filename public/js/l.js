$(function() {
  var uniqueId = 1;
  var feelCard = function(div_id) {
    $('#'+div_id+' .panel-heading').text(json_obj.beer+' ['+json_obj.brewary+']');
  }
  var url = '/beers/api/search';
	$('#form-submit').click(function(e){
    $('[id*="clone"]').remove(); // remove cloned elems if exists
    // get query text from form id='f1' or from attr placeholder
    var query = $('#f1').val() || $('#f1').attr('placeholder');
    console.log('query: '+query);
    // start ladda spinner
	 	e.preventDefault();
	 	var l = Ladda.create(this);
	 	l.start();
    // ajax GET XHR
    $.get(url, { query : query },
	 	  function(response){
        console.log('HTTP response OK');
        $('#dataset').removeClass('hidden').addClass('container');
        response.forEach(function (item) {
          json_obj = item._source;
          console.log(json_obj.title);
          // clone pug beer card pattern
          var div_id = 'clone'+uniqueId;
          $('.panel-primary').not('[id*="clone"]').clone().appendTo('#ba_jumbotron_hid').attr('id', div_id );
          if( json_obj.hasOwnProperty('Название') && json_obj.hasOwnProperty('BA_beer')) {
            // both cards
          } else if (!json_obj.hasOwnProperty('Название')) {
            $('[id*="clone"] .row .col-md-5').remove(); // remove col-md-5 apivo
          } else if (!json_obj.hasOwnProperty('BA_beer')) {
            $('[id*="clone"] .row .col-md-4').remove(); // remove col-md-4 ba
          }

          feelCard(div_id);
          uniqueId++;
        });
	 	  }, "json")
    .always(function() {
      l.stop();
    });
	 	return false;
	});
});
