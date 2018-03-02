$(function() {
  var ba = {}, ap = {},
      card = 'ba'; // default card type = ba
      uniqueId = 1;

  // advanced data
  var advanced = {};
  $('.panel-heading')
  .find('a')
  .click(function (e) {
    // feel default data object
    advanced = {
      brew: $('#f2').attr('placeholder')
    }
    // console.log('default data:\n'+JSON.stringify(advanced,null,2));
    // brew keyup event handler
    $('#f2').keyup(function (event) {
      advanced = {
        brew: $('#f2').val()
      }
      // console.log('updated data: '+JSON.stringify(advanced,null,2));
    })
  })

  // URL API
  var url = '/beers/api/search';
  // '#form-submit' click EVENT handler
	$('#form-submit').click(function(e){
    $('[id*="clone"]').remove(); // remove cloned elems if exists
    // get query text from form id='f1' or from attr placeholder
    var beer_query = $('#f1').val() || $('#f1').attr('placeholder'),
        post_body = {};
    // define simple query
    post_body = {
      query: {
        beer: beer_query
      },
      action: "search"
    }

    var expanded = $('.panel-heading')
    .find('a').attr('aria-expanded');

    if(expanded === 'true') {
      if(advanced.hasOwnProperty('brew')) {
        post_body.query.brew = advanced.brew;
        post_body.query.query_type = 'advanced';
      }
    }

    console.log('post_body: '+JSON.stringify(post_body,null,2));

    // start ladda spinner
	 	e.preventDefault();
	 	var l = Ladda.create(this);
	 	l.start();
    $('#paginator').removeClass('container').addClass('hidden').find('ul').remove();
    $('#ba_jumbotron_hid')
      .removeClass('jumbotron')
      .addClass('hidden')
      .after('<img id="spinner" src="../images/spinner2.gif">');

    // ajax POST XHR
    var request = $.ajax({
      url:url,
      type: 'POST',
      data: JSON.stringify(post_body),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json'});
    request.fail(function (err, msg) {
      l.stop(); // stop spinner anyway
      $('#spinner').remove();
      $('#ba_jumbotron_hid').removeClass('hidden').addClass('jumbotron');
      console.log('Request failed.\nStatus:'+err.status+'\nStatus text: '+err.statusText+'\nError message: '+msg);
    });
    request.done(function(response) {
      l.stop(); // stop spinner anyway
      $('#spinner').remove();
      $('#ba_jumbotron_hid').removeClass('hidden').addClass('jumbotron');
      render(response, beer_query);
    });
	 	return false;
	});


/*
* render functions
*/
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
    var img = $('#'+div_id+' img'); // locate img
    img.attr('alt',ba.beer+' ['+ba.brew+']'); // set alt attr for IMG
    // draw img
    if(ba.img !== null) {
      img.removeClass('img-circle')
      .addClass('img-rounded')
      .attr({
        src:  ba.img,
        style:  'width:60%'
      });
    }
  }
  var feelCardAp = function(div_id) {
    $('#'+div_id+' .panel-heading').text(ap.beer);
    $('#'+div_id+' div.ap_brew').append(' '+ap.brew); // append brewary
    $('#'+div_id+' div.ap_beer').append(' '+ap.beer); // append beer
    $('#'+div_id+' div.ap_style').append(' '+ap.style); // append ap_style
    $('#'+div_id+' div.ap_country').append(' '+ap.country); // append ap_country
    $('#'+div_id+' div.ap_abv').append(' '+ap.abv); // append ap_abv
    $('#'+div_id+' div.ap_type').append(' '+ap.type); // append type
    $('#'+div_id+' div.ap_price').append(' '+ap.price); // append price
    $('#'+div_id+' div.ap_url > a').attr('href', ap.url); // update ap_url
    var img = $('#'+div_id+' img'); // locate img
    img.attr('alt',ap.beer+' ['+ap.brew+']'); // set alt attr for IMG
    // draw img
    if((ap.img !== null && ba.img !== null)
    ||
    (ba.img === null && ap.img !== null)) {
      img.removeClass('img-circle')
      .addClass('img-responsive')
      .attr({
        src:  ap.img,
        // style:  'height:60%'
      });
    }
    if(ba.img !== null && ap.img === null) {
      img.removeClass('img-circle')
      .addClass('img-rounded')
      .attr({
        src:  ba.img,
        // style:  'width:60%'
      });
    }
    // add description if exist
    if(ap.desc.hasOwnProperty(0)){
      console.log('ap.desc: '+JSON.stringify(ap.desc,null,2)+'\nap.beer: '+ap.beer);
      var modal = $('#'+div_id+' #modal') // locate modal
      .removeClass('hidden') // remove hidden class
      .find('#apModalLabel').text(ap.beer+' ['+ap.brew+']'); // add title
      // build description elems
      var div_txt = '';
      for(prop in ap.desc){
        div_txt+='<div class="text-info">'+ap.desc[prop]+'</div><br>';
      }
      modal.find('.ap_desc').append(div_txt); // append description
      modal.find('a').attr('href', ap.url); // update ap_url
    }
    // console.log('is ap.sostav === undefined: '+(ap.sostav===undefined));
    // unhide hidden if data exists
    var col = $('#'+div_id+' #ap_col');
    if(ap.sostav!==undefined) {
      col.find('#ap_sostav')
      .removeClass('hidden') // remove hidden class
      .append(' '+ap.sostav);
    }
    if(ap.tara!==undefined) {
      col.find('#ap_tara')
      .removeClass('hidden') // remove hidden class
      .append(' '+ap.tara);
    }
    // if(ap.past!==undefined) {
    //   col.find('#ap_past')
    //   .removeClass('hidden') // remove hidden class
    //   .append(' '+ap.past);
    // }
    if(ap.density!==null) {
      col.find('#ap_density')
      .removeClass('hidden') // remove hidden class
      .append(' '+ap.density);
    }
    if(ap.taste!==undefined) {
      col.find('#ap_taste')
      .removeClass('hidden') // remove hidden class
      .append(' '+ap.taste);
    }
    if(ap.filter!==undefined) {
      col.find('#ap_filter')
      .removeClass('hidden') // remove hidden class
      .append(' '+ap.filter);
    }
  }

  // show pagination
  var paginator = function (options, docs, pages) {
    console.log('pages: '+pages+'\ndocs: '+docs+'\npage: '+options.page);
    var ul = '<ul class="pagination text-center"></ul>';
    $('#paginator')
      .removeClass('hidden')
      .addClass('container')
      .append(ul);
    ul = $('#paginator').find('ul');
    if( options.page === 1 ) ul.append('<li class="disabled"><a>First</a></li>');
    else ul.append('<li><a page="1">First</a></li>');
    var i = (Number(options.page) > 5 ? Number(options.page) - 4 : 1);
    if(i != 1) ul.append('<li class="disabled"><a>...</a></li>');
    for (; i <= (Number(options.page) + 4) && i <= pages; i++) {
      if (i == options.page)
        ul.append('<li class="active"><a>'+i+'</a></li>');
      else
        ul.append('<li><a page='+i+'>'+i+'</a></li>');
      if(i == Number(options.page) + 4 && i < pages)
        ul.append('<li class="disabled"><a>...</a></li>');
    }
    if(options.page === pages) ul.append('<li class="disabled"><a>Last</a></li>');
    else ul.append('<li><a page='+pages+' page='+pages+'>Last</a></li>');

    // paginator event handler
    $('.pagination.text-center')
    .find('a')
    .click(function (event) {
      var page = $(this).attr('page');
      var beer_query = $('#f1').val() || $('#f1').attr('placeholder'),
          post_body = {};
      console.log('page: '+page+'\n beer_query: '+beer_query);

      // define simple query
      post_body = {
        query: {
          beer: beer_query
        },
        action: "search",
        page: page,
        size: 20
      }

      $('[id*="clone"]').remove(); // remove cloned elems if exists
      $('#ba_jumbotron_hid')
        .removeClass('jumbotron')
        .addClass('hidden')
        .after('<img id="spinner" src="../images/spinner2.gif">');

      // ajax POST XHR
      var request = $.ajax({
        url:url,
        type: 'POST',
        data: JSON.stringify(post_body),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'});
      request.fail(function (err, msg) {
        console.log('Request failed.\nStatus:'+err.status+'\nStatus text: '+err.statusText+'\nError message: '+msg);
        $('#paginator').removeClass('container').addClass('hidden').find('ul').remove();
        $('#ba_jumbotron_hid').removeClass('hidden').addClass('jumbotron');
        $('#spinner').remove();
      });
      request.done(function(response) {
        $('#paginator').removeClass('container').addClass('hidden').find('ul').remove();
        $('#ba_jumbotron_hid').removeClass('hidden').addClass('jumbotron');
        $('#spinner').remove();
        render(response, beer_query);
      });

    })

  }

  // feel objects & render response
  var render = function(response, beer_query) {
    console.log('HTTP response OK');
    var dataset = $('#dataset').removeClass('hidden').addClass('container');
    // Beer not found!
    if(response.beers.length === 0) {
      dataset.find('.jumbotron')
      .html('<div class="alert alert-danger"><strong>404</strong> Beer "'+beer_query+'" not found!</div>');
    }
    else dataset.find('.alert.alert-danger').remove();

    response.beers.forEach(function(json_obj) {
      // console.log(json_obj.title);
      // clone pug beer card pattern
      var div_id = 'clone'+uniqueId;
      $('.panel-primary').not('[id*="clone"]')
      .clone()
      .appendTo('#ba_jumbotron_hid')
      .attr('id', div_id );
      // set card type and data
      if( json_obj.hasOwnProperty('ap_beer')
      && json_obj.hasOwnProperty('ba_beer')) {
          card = 'apba';
          ba.score = json_obj.ba_beer_score;
          ba.img = json_obj.ba_img;
          ba.beer = json_obj.ba_beer;
          ba.brew = json_obj.ba_brewary;
          ba.style = json_obj.ba_style;
          ba.category = json_obj.ba_category;
          ba.abv = json_obj.ba_abv;
          ba.url = json_obj.ba_url;
          ba.score_percent = Math.round(json_obj.ba_beer_score/0.05);
          ap.beer = json_obj.ap_beer;
          ap.brew = json_obj.ap_brewary;
          ap.style = json_obj.ap_style;
          ap.country = json_obj.ap_country;
          ap.abv = json_obj.ap_abv;
          ap.type = json_obj.ap_type || undefined;
          ap.price = json_obj.ap_price_str;
          ap.vol = json_obj.ap_vol;
          ap.tara = json_obj.ap_tara;
          ap.url = json_obj.ap_url;
          if(json_obj.hasOwnProperty('ap_desc')) ap.desc = json_obj.ap_desc;
          else ap.desc = {};
          ap.img = json_obj.ap_img;
          ap.past = '';
          if(json_obj.hasOwnProperty('ap_density')) ap.density = json_obj.ap_density;
          else ap.density = undefined;
          ap.taste = json_obj.ap_taste || undefined;
          ap.filter = json_obj.filter || undefined;
          ap.sostav = json_obj.ap_composition || undefined;
      } else if (!json_obj.hasOwnProperty('ap_beer')) {
          card = 'ba';
          ba.score = json_obj.ba_beer_score;
          ba.beer = json_obj.ba_beer;
          ba.brew = json_obj.ba_brewary;
          ba.style = json_obj.ba_style;
          ba.category = json_obj.ba_category;
          ba.abv = json_obj.ba_abv;
          ba.url = json_obj.ba_url;
          ba.score_percent = Math.round(json_obj.ba_beer_score/0.05);
          ba.img = json_obj.ba_img;
          $('[id*="clone"] #ap_col').remove(); // remove apivo column
      } else if (!json_obj.hasOwnProperty('ba_beer')
      &&  json_obj.hasOwnProperty('ap_beer')) {
          card = 'ap';
          ap.beer = json_obj.ap_beer;
          ap.brew = json_obj.ap_brewary;
          ap.style = json_obj.ap_style;
          ap.country = json_obj.ap_country;
          ap.abv = json_obj.ap_abv;
          ap.type = json_obj.ap_type || undefined;
          ap.price = json_obj.ap_price_str;
          ap.vol = json_obj.ap_vol;
          ap.tara = json_obj.ap_tara;
          ap.url = json_obj.ap_url;
          if(json_obj.hasOwnProperty('ap_desc')) ap.desc = json_obj.ap_desc;
          else ap.desc = {};
          ap.img = json_obj.ap_img;
          ap.past = '';
          if(json_obj.hasOwnProperty('ap_density')) ap.density = json_obj.ap_density;
          else ap.density = undefined;
          ap.taste = json_obj.ap_taste || undefined;
          ap.filter = json_obj.filter || undefined;
          ap.sostav = json_obj.ap_composition || undefined;
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
    }); // end forEach
    // show paginator
    if(response.pages > 0) paginator(response.options, response.docs, response.pages);

  } // end render function
}); // end DOM ready

// update progress-bar
function upd_progessbar(div, value) {
  var span = div.find('span');
  div.attr('aria-valuenow', value);
  div.css('width', value + '%');
  span.text(value + '% Complete');
}
