$(document).ready(function(){

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
  }
  
  //Current userid and auth token
  var userId = getCookie("userId");
  var token = getCookie("Authorization");

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

  //profile section user posts image modal
  $('img').on('click', function (ce) {
       var image = $(this).attr('src');
       var likes = $(this).data('likes');
       var photo_id = $(this).data('photoid');
       if(!likes){ //to check if the image has 0 likes
         likes = 0;
       }

       $("#like_btn").on('click',function(e){
         //var curr_like = $(this)
         console.log(likes);
         //$("#like_badge").html(likes+1);
         //e.stopPropagation();
         var token = "Bearer 7t3o1mv8fv2b9nhsbq825w3me3mpwvft";
         $.ajax({
            type: "POST",
            url: "http://data.c100.hasura.me/v1/query",
            cache: false,
            crossDomain: true,
            headers: { 'Content-Type' : 'application/json',
                        'Authorization': token
            },
            dataType: 'json',
            data: JSON.stringify({
              "type": "insert",
                "args":{
                        "table": "like",
                        "objects": [
                          { "user_id": userId,
                            "photo_id": photo_id
                          }
                        ]
                }
            }),
            xhrFields: {
                withCredentials: true
            },
            error : function(err){
              console.log(err);
            },
            success: function (data) {
                console.log(data);
          }
        });
       });

       $('#myModal').on('show.bs.modal', function () {
           $(".modal_img").attr("src", image);
           $("#like_badge").html(likes);
       });

   });



  //Handle File upload
  const guid = () => ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
  return v.toString(16);
  }));

  console.log(guid());


});
