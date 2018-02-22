$(function() {
  var ba = {}, ap = {},
      card = 'ba'; // default card type = ba
      uniqueId = 1;
  // feel cards after JSON response
  var feelCardBa = function(div_id) {
    $('#'+div_id+' .panel-heading').text(ba.beer+' ['+ba.brew+']');
    $('#'+div_id+' #ba_col .text-primary').append(' '+ba.score+' / ').append('<span class="text-danger">5</span>');
    var pb = $('#'+div_id+' .progress-bar'); // get progress-bar element
    upd_progessbar(pb, ba.score_percent); // update progress-bar
    $('#'+div_id+' div.ba_brew').append(' '+ba.brew); // append brewary
    $('#'+div_id+' div.ba_beer').append(' '+ba.beer); // append beer
    $('#'+div_id+' div.ba_style').append(' '+ba.style); // append style
    $('#'+div_id+' div.ba_category').append(' '+ba.category); // append category
    $('#'+div_id+' div.ba_abv').append(' '+ba.abv); // append ba_abv
    $('#'+div_id+' div.ba_url > a').attr('href', ba.url); // update ba_url
    // draw img
    if(ba.img !== null) {
      $('#'+div_id+' img')
      .removeClass('img-circle')
      .addClass('img-rounded')
      .attr('src',ba.img);
    }
  }
  var feelCardAp = function(div_id) {
    $('#'+div_id+' .panel-heading').text(ap.beer);
    $('#'+div_id+' #ap_col .text-primary').append(' '+ap.beer);
    $('#'+div_id+' div.ap_brew').append(' '+ap.brew); // append brewary
    $('#'+div_id+' div.ap_beer').append(' '+ap.beer); // append beer
    $('#'+div_id+' div.ap_style').append(' '+ap.style); // append ap_style
    $('#'+div_id+' div.ap_country').append(' '+ap.country); // append ap_country
    $('#'+div_id+' div.ap_abv').append(' '+ap.abv); // append ap_abv
    $('#'+div_id+' div.ap_type').append(' '+ap.type); // append type
    $('#'+div_id+' div.ap_price').append(' '+ap.price); // append price
    // draw img
    if((ap.img !== null && ba.img !== null)
    ||
    (ba.img === null && ap.img !== null)) {
      $('#'+div_id+' img')
      .removeClass('img-circle')
      .addClass('img-rounded')
      .attr('src',ap.img);
    }
    if(ba.img !== null && ap.img === null) {
      $('#'+div_id+' img')
      .removeClass('img-circle')
      .addClass('img-rounded')
      .attr('src',ba.img);
    }
    // add description if exist
    if(ap.desc){
      var modal = $('#'+div_id+' #modal');
      modal.find('#apModalLabel').text(ap.beer);
      modal.removeClass('hidden');
    }

  }
  // URL API
  var url = '/beers/api/search';
  // '#form-submit' click EVENT handler
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
        response.forEach(function(item) {
          json_obj = item._source;
          // console.log(json_obj.title);
          // clone pug beer card pattern
          var div_id = 'clone'+uniqueId;
          $('.panel-primary').not('[id*="clone"]')
          .clone()
          .appendTo('#ba_jumbotron_hid')
          .attr('id', div_id );
          // set card type and data
          if( json_obj.hasOwnProperty('Название')
          && json_obj.hasOwnProperty('BA_beer')) {
              card = 'apba';
              ba.score = json_obj.BA_score;
              ba.beer = json_obj.BA_beer;
              ba.brew = json_obj.BA_brewary;
              ba.style = json_obj.BA_style;
              ba.category = json_obj.BA_category;
              ba.abv = json_obj.BA_abv;
              ba.url = json_obj.BA_url;
              ba.score_percent = Math.round(json_obj.BA_score/0.05);
              ap.beer = json_obj.Название;
              ap.brew = json_obj.brewary;
              ap.style = json_obj["Вид пива"];
              ap.country = json_obj["Страна"];
              ap.abv = json_obj.abv;
              ap.type = json_obj["Тип брожения"];
              ap.price = json_obj.Цена;
              ap.vol = json_obj.vol;
              ap.tara = json_obj.Тара;
              ap.url = json_obj.url;
              ap.desc = json_obj.desc;
              ap.img = json_obj.img;
              ap.past = json_obj.Пастеризация;
              ap.density = json_obj.Плотность;
              ap.taste = json_obj["Вкусовые оттенки"];
              ap.filter = json_obj.Фильтрация;
          } else if (!json_obj.hasOwnProperty('Название')) {
              card = 'ba';
              ba.score = json_obj.score;
              ba.beer = json_obj.beer;
              ba.brew = json_obj.brewary;
              ba.style = json_obj.style;
              ba.category = json_obj.category;
              ba.abv = json_obj.abv;
              ba.score_percent = json_obj.score_percent;
              ba.url = json_obj.url;
              ba.img = json_obj.img;
              $('[id*="clone"] #ap_col').remove(); // remove apivo column
          } else if (!json_obj.hasOwnProperty('BA_beer')) {
              card = 'ap';
              ap.beer = json_obj.Название;
              ap.brew = json_obj.brewary;
              ap.style = json_obj["Вид пива"];
              ap.country = json_obj["Страна"];
              ap.abv = json_obj.abv;
              ap.type = json_obj["Тип брожения"];
              ap.price = json_obj.Цена;
              ap.vol = json_obj.vol;
              ap.tara = json_obj.Тара;
              ap.url = json_obj.url;
              ap.desc = json_obj.desc;
              ap.img = json_obj.img;
              ap.past = json_obj.Пастеризация;
              ap.density = json_obj.Плотность;
              ap.taste = json_obj["Вкусовые оттенки"];
              ap.filter = json_obj.Фильтрация;
              $('[id*="clone"] #ba_col').remove(); // remove ba column
          }

          // feel card using JSON response
          if(card === 'ba') feelCardBa(div_id);
          else if(card === 'ap') feelCardAp(div_id);
          else {
            feelCardBa(div_id);
            feelCardAp(div_id);
          }

          uniqueId++; // next div ID
        });
	 	  }, "json")
    .always(function() {
      l.stop(); // stop spinner anyway
    });
	 	return false;
	});
});

// update progress-bar
function upd_progessbar(div, value) {
  var span = div.find('span');
  div.attr('aria-valuenow', value);
  div.css('width', value + '%');
  span.text(value + '% Complete');
}
