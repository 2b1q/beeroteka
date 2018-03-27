$(function () {
  var path = $(location).attr('pathname');
  var navbar = $('.nav.navbar-nav');
  if(path === '/') navbar.find('li').eq(0).addClass('active');
  if(path === '/beers/search') navbar.find('li').eq(1).addClass('active');
  if(path === '/beers/search2') navbar.find('li').eq(2).addClass('active');
  if(path === '/beers') navbar.find('li').eq(3).addClass('active');
  if(path === '/beers/graphics') navbar.find('li').eq(4).addClass('active');
})
