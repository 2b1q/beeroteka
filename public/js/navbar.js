$(function () {
  var path = $(location).attr('pathname');
  var navbar = $('.nav.navbar-nav');
  if(path === '/') navbar.find('li').eq(0).addClass('active');
  if(path === '/beers/search') navbar.find('li').eq(1).addClass('active');
  if(path === '/beers') navbar.find('li').eq(2).addClass('active');
})
