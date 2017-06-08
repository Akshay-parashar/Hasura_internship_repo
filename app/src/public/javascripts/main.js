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

  // Register Form Validations
  $.validator.setDefaults({
    errorClass: 'help-block',
    highlight : function(element) {
      $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight : function(element) {
      $(element).closest('.form-group').removeClass('has-error');
    },
    errorPlacement : function(error,element) {
      error.appendTo(element.next());
    }
  });

  $('#register_form').validate({
    onsubmit : false,
    rules: {
      name : "required",
      user_name : "required",
      email: {
        required : true,
        email: true
      },
      user_password : {
        required : true,
        minlength : 8
      },
      confirm_password : {
        required : true,
        equalTo : "#usr_pass"
      }
    },
    messages: {
      name: {
        required : 'Name cannot be left blank'
      },
      user_name: {
        required : 'Username cannot be left blank'
      },
      email: {
        required : "Email cannot be left blank",
        email : "Enter a valid email address"
      },
      password: {
        required : "Password cannot be left blank",
        minlength : "Password should be atleast 8 character/digits in length"
      },
      confirm_password : {
        required : "This field cannot be left blank",
        equalTo: "Passwords dont match!"
      }
    }
  });


});
