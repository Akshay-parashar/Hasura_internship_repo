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

  var notif = function(notif_type,notif_text,glyph,pos,anim_in,anim_out) {
    if(!glyph){
      glyph = "glyphicon glyphicon-asterisk";
    }
    if(!pos){
      pos = "top";
    }
    if(!anim_in && !anim_out){
      anim_in = 'animated bounceInDown';
      anim_out = 'animated bounceOutUp';
    }
    $.notify({
      //options
      icon: glyph,
      title: '<strong> Notification: </strong>',
      message: notif_text
    },{
      //settings
       type: notif_type,
       allow_dismiss: true,
       delay: 4000,
       animate: {
           enter: anim_in,
           exit: anim_out
       },
       placement: {
		       from: pos,
		       align: "right"
	     }
    });
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

       /*$("#like_btn").on('click',function(e){
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
      });*/

       $('#myModal').on('show.bs.modal', function () {
           $(".modal_img").attr("src", image);
           $("#like_badge").html(likes);
       });

   });

   //Follow button
   $("#follow_btn").on('click',function(){
     var ssusrid = $(this).data('usrsid');
     $.ajax({
        type: "POST",
        url: "http://data.c100.hasura.me/v1/query",
        cache: false,
        crossDomain: true,
        headers: { 'Content-Type' : 'application/json',
                    'Authorization': token
        },
        data: JSON.stringify({
          "type": "insert",
            "args":{
                    "table": "following",
                    "objects": [
                      { "user_id": userId,
                        "following_id": ssusrid
                      }
                    ]
            }
        }),
        error : function(err){
          console.log(err);
        },
        success: function (data) {
            console.log(data);
            notif("info","You are now following this user,page will refresh shortly!","glyphicon glyphicon-ok");
            setTimeout(function() {
              location.reload();
            },3000);
          }
      });
    });

    //Following button
    $("#following_btn").on('click',function(){
      var followingid = $(this).data('usrsid');
      $.ajax({
         type: "POST",
         url: "http://data.c100.hasura.me/v1/query",
         cache: false,
         crossDomain: true,
         headers: { 'Content-Type' : 'application/json',
                     'Authorization': token
         },
         data: JSON.stringify({
           "type": "delete",
             "args":{
                     "table": "following",
                     "where": { user_id: userId , following_id: followingid},
                     "returning" : ["id"]
             }
         }),
         error : function(err){
           console.log(err);
         },
         success: function (data) {
             console.log(data);
             notif("warning","You have unfollowed this user,page will refresh shortly!","glyphicon glyphicon-ok");
             setTimeout(function() {
               location.reload();
             },3000);
           }
       });
     });





  //Handle File upload
  const guid = () => ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
  return v.toString(16);
  }));

  console.log(guid());

  // Feed image upload
  $("#feed_pic_browse_btn").on('click', function(){
    var feed_file = $('#up_file');
    feed_file.trigger('click');
  });

  $('#up_file').on('change',function() {
    $(".feed_file_br_text").text("Change");
    $('.feed_sel_fname').val($(this).val().replace(/C:\\fakepath\\/i, ''));
    notif("info","Image Selected","glyphicon glyphicon-ok","bottom","animated bounceInRight","animated bounceOutRight");
  });

  $("#feed_file_upload_btn").click(function() {
    var selected_image = $('#up_file')[0].files[0];
    if(!selected_image) {
      notif("danger","Please select an image to upload","glyphicon glyphicon-remove","bottom","animated bounceInRight","animated bounceOutRight");
      return;
    }
    var tokval = token.split(" ");
    var upfileid = guid();
    var filestore_urll = "http://filestore.c100.hasura.me/v1/file/" + upfileid;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
     if (this.readyState == 4 && this.status == 200) {
         console.log("Response from XMLHttp: " + this.responseText);
         //another request to store fileid in photos table
         $.ajax({
            type: "POST",
            url: "http://data.c100.hasura.me/v1/query",
            cache: false,
            crossDomain: true,
            headers: { 'Content-Type' : 'application/json',
                        'Authorization': token
            },
            data: JSON.stringify({
              "type": "insert",
                "args":{
                        "table": "photo",
                        "objects": [
                            {
                              "poster_id": userId,
                              "content": upfileid
                            }
                        ]
                }
            }),
            error: function(err){
              console.log(err);
            },
            success: function (data) {
                console.log("Success response from $.ajax!!");
                console.log(data);
                $("#upload_modal").modal('hide');
                notif("success","Image succesfully uploaded. Page will refresh shortly","glyphicon glyphicon-ok");
                setTimeout(function() {
                  location.reload();
                },3000);
            }
        });
     }
    };
    req.open('POST',filestore_urll, true);
    req.setRequestHeader('Authorization','Bearer '+ tokval[1]);
    req.setRequestHeader('Content-type', + selected_image.type);
    req.send(selected_image);
  });
  //------

  // Profile image upload
  $(document).on('click', '.browse', function(){
  var file = $('#profile_file');
  file.trigger('click');
  });

  $(document).on('change', '#profile_file', function(){
    $(this).parent().find('.br_btn_text').text("Change");
    $(this).parent().parent().find('.form-control').val($(this).val().replace(/C:\\fakepath\\/i, ''));
    notif("info","Image Selected","glyphicon glyphicon-ok");
  });


  $(document).on('click', '.upload', function(){
   //$(this).parent().parent().find('.form-control').val("Upload Profile Image", "");
   var selected_file = $('#profile_file')[0].files[0];
   if(!selected_file) {
     notif("danger","Please select an image to upload","glyphicon glyphicon-remove");
     return;
   }
   var tok = token.split(" ");
   var fileid = guid();
   //console.log("This is info about selected file.files[0]: " + selected_file.files[0]);
   var filestore_url = "http://filestore.c100.hasura.me/v1/file/" + fileid;
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log("Response from XMLHttp: " + this.responseText);
        //another request to store fileid in app_user table
        $.ajax({
           type: "POST",
           url: "http://data.c100.hasura.me/v1/query",
           cache: false,
           crossDomain: true,
           headers: { 'Content-Type' : 'application/json',
                       'Authorization': token
           },
           data: JSON.stringify({
             "type": "update",
               "args":{
                       "table": "app_user",
                       "$set" : {"profile_image_link" : fileid},
                       "where" : {"id" : userId},
                       "returning" : ["id"]
               }
           }),
           error: function(err){
             console.log(err);
           },
           success: function (data) {
               console.log("Success response from $.ajax!!");
               console.log(data);
               notif("success","Image succesfully uploaded. Page will refresh shortly","glyphicon glyphicon-ok");
               setTimeout(function() {
                 location.reload();
               },3000);
           }
       });
    }
   };
   xhttp.open('POST',filestore_url, true);
   xhttp.setRequestHeader('Authorization','Bearer '+ tok[1]);
   xhttp.setRequestHeader('Content-type', + selected_file.type);
   xhttp.send(selected_file);

   $(this).parent().find('.br_btn_text').text("Browse");
   $(this).parent().parent().find('.form-control').val($(this).val().replace("", '/C:\\fakepath\\/i'));
  });
  //------------------------

});
