$(document).ready(function(){
    $.get("https://cdn.beeradvocate.com/im/beeradvocate-nav-logo.png",function(data,status){
     console.log(status);
    })
    .done(function () {
      console.log("loaded");
    })
    .fail(function () {
      console.log("load URL fail!");
    })
});
