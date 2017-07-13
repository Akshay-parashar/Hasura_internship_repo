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

  $(document).on('click', '.browse', function(){
  var file = $('#profile_file');
  file.trigger('click');
  });

  $(document).on('change', '#profile_file', function(){
    $(this).parent().find('.br_btn_text').text("Change");
    $(this).parent().parent().find('.form-control').val($(this).val().replace(/C:\\fakepath\\/i, ''));
  });

  $(document).on('click', '.upload', function(){
   //$(this).parent().parent().find('.form-control').val("Upload Profile Image", "");
   var selected_file = $('#profile_file')[0].files[0];
   //console.log("Selected file info: ");
   //console.log(selected_file);
   var reader = new FileReader();
   reader.readAsDataURL(selected_file);
   reader.onload = function(fl) {
     var filestore_url = "http://filestore.c100.hasura.me/v1/file/" + guid();
     var tk = "Bearer 5o7lfksynbezwkw9r5dl6b770dq0m0b7" //admin token (check if expired)
     $.ajax({
        type: "POST",
        url: filestore_url,
        cache: false,
        crossDomain: true,
        headers: { 'Content-Type' : selected_file.type,
                    'Authorization': tk
        },
        data: JSON.stringify({
          "img_data": encodeURIComponent(fl.target.result)
        }),
        error: function(err){
          console.log(err);
          //console.log("this is the tokn: " + token);
          //console.log("this is the file type: " + selected_file.type);
          //console.log("this is the data: " + fl.target.result);
        },
        success: function (data) {
            console.log(data);
        }
    });
   }

   $(this).parent().find('.br_btn_text').text("Browse");
  });

});
