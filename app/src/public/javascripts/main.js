$(document).ready(function(){

  //Event To adjust placment of navlinks in navbar
  if ($(window).width() > 768){
       $('.navbar-nav').addClass('pull-right');
   }

  $(window).resize(function(){
    if ($(window).width() > 768){
         $('.navbar-nav').addClass('pull-right');
     }
    else {
      $('.navbar-nav').removeClass('pull-right');
    }
  });


});
