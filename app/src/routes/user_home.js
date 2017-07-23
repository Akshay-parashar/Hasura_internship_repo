var express = require('express');
var router = express.Router();
var rp = require('request-promise');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.cookies);
  console.log(req.cookies.Authorization);
  checkUserIdentity(req.cookies.Authorization,"user_home ",function(identity){
    if(identity == "anon user" || identity == "user token expired") {
        res.redirect('../');
    }
    else if(identity == "authenticated user") {
        console.log("Logged in---------------------------");
        //Make the necessary request to get the data
        var imagefeed_data = [];
        var like_data = [];

        var like_data_req = {
            method: 'POST',
            uri:"http://data.app.hasura.me/v1/query",
            headers: {
              "Authorization": req.cookies.Authorization
            },
            body: {
              type: "select",
              args: {
                table: "like",
                columns: ["photo_id"],
                where: {user_id: req.cookies.userId }
              }
            },
            json: true
        };

        var imagefeed_data_req = {
            method: 'POST',
            uri:"http://data.app.hasura.me/v1/query",
            headers: {
              "Authorization": req.cookies.Authorization
            },
            body: {
              type: "select",
              args: {
                table: "user_imagefeed",
                columns: ["no_likes","content","following_username","photo_id"],
                where: {id: req.cookies.userId }
              }
            },
            json: true
        };

        rp(like_data_req).then(function(response) {
          //user has liked some pics
          if(response.length > 0){
            console.log("User has liked some pics and data is stored in array");
            response.forEach(function(likedata){
            like_data.push(likedata.photo_id);
            });

            rp(imagefeed_data_req).then(function(response) {
              console.log(response);
              response.forEach( function (image){
                if(like_data.length > 0 && image.photo_id) {
                  console.log("Matching image.id: " + image.photo_id + " in liked_data array");
                  if(like_data.indexOf(image.photo_id) >= 0){
                    image.liked = true;
                  }
                }
                if(!image.no_likes){
                  image.no_likes = 0;
                }
                if(!image.content){
                  return;
                }
              imagefeed_data.push(image);
              });
              console.log("This is data being sent to the view ----")
              console.log(imagefeed_data);
              res.render('dashboard',{logged_in: true, active_home: true, image_data: imagefeed_data});

            }).
            catch(function (err) {
              console.log(err);
            });

          }
          else {
            //user has liked 0 pics
            console.log("User has liked 0 pics");
            rp(imagefeed_data_req).then(function(response) {
              console.log(response);
              if(response.length){
              response.forEach( function (image){
                if(like_data.length > 0 && image.photo_id) {
                  console.log("Matching image.id: " + image.photo_id + " in liked_data array");
                  if(like_data.indexOf(image.photo_id) >= 0){
                    image.liked = true;
                  }
                }
                if(!image.no_likes){
                  image.no_likes = 0;
                }
                if(!image.content){
                  return;
                }
              imagefeed_data.push(image);
              });
              }
              console.log("This is data being sent to the view ----")
              console.log(imagefeed_data);
              res.render('dashboard',{logged_in: true, active_home: true, image_data: imagefeed_data});

            }).
            catch(function (err) {
              console.log(err);
            });

          }
        })
        .catch(function(err) {
          console.log(err);
        });

    }// end - else if statement(authenticated user)
  }); // end - checkUserIdentity()
}); // end - route

//Following list
router.get('/profile/following_list',function(req,res) {
  checkUserIdentity(req.cookies.Authorization,"profile ",function(identity){
    if(identity == "anon user" || identity == "user token expired") {
        res.redirect('../');
    }
    else if(identity == "authenticated user") {
      //Make a req to the following of this user
      var following_list = [];
      var following_list_req = {
          method: 'POST',
          uri:"http://data.app.hasura.me/v1/query",
          headers: {
            "Authorization": req.cookies.Authorization
          },
          body: {
            type: "select",
            args: {
              table: "following_info_updated",
              columns: ["*"],
              where: {user_id: req.cookies.userId }
            }
          },
          json: true
      }

      rp(following_list_req).then(function(response){
        if(response.length == 0){
          //this user is not following any user,render a view that tells the user.
          res.render('following_page',{logged_in: true, no_followings: true});
        }
        else {
          response.forEach(function(usr){
            following_list.push(usr);
          });
          //render the view and pass this data
          res.render('following_page',{logged_in: true, followings: following_list});
        }

      }) //end then
      .catch(function(err) {
        console.log(err);
      }); //end catch


    } // end else if
  }); //end checkUserIdentity

}); // end route /profile/following_list


router.get('/profile',function(req,res) {
  //Role based access on the view
  checkUserIdentity(req.cookies.Authorization,"profile ",function(identity){
    if(identity == "anon user" || identity == "user token expired") {
        res.redirect('../');
    }
    else if(identity == "authenticated user") {
      //Make the necessary request to get the data
      var data_user_stats;
      var data_user_images = [];

      var user_stats_req = {
          method: 'POST',
          uri:"http://data.app.hasura.me/v1/query",
          headers: {
            "Authorization": req.cookies.Authorization
          },
          body: {
            type: "select",
            args: {
              table: "user_stats",
              columns: ["*"],
              where: {id: req.cookies.userId }
            }
          },
          json: true
      };

      var user_images_req = {
          method: 'POST',
          uri:"http://data.app.hasura.me/v1/query",
          headers: {
            "Authorization": req.cookies.Authorization
          },
          body: {
            type: "select",
            args: {
              table: "photo_stats",
              columns: ["id","content","no_likes"],
              where: {poster_id: req.cookies.userId }
            }
          },
          json: true
      };



      rp(user_stats_req).then(function (response){
        console.log("succesfully retrieved some user data");
        console.log(response[0]);
        data_user_stats = response[0];
        data_user_stats.username = req.cookies.userName;
        /*console.log(response[0].id);
        console.log(response[0].name);
        console.log(response[0].photos);*/
        rp(user_images_req).then(function (response){
          console.log("succesfully retrieved user images");
          console.log(response);
          response.forEach( function (image){
          data_user_images.push(image);
          });
          console.log("---------------");
          console.log(data_user_images);
          res.render('profile',{logged_in: true, active_profile: true, images: data_user_images,user_stats: data_user_stats});

        })
        .catch(function(err){
          console.log("There was some error retrieving user images");
          console.log(err);
        });

      })
      .catch(function(err){
        console.log("There was some error retrieving user data");
        console.log(err);
      });

        //res.render('profile',{logged_in: true, active_profile: true});
    }
  });

});

router.get('/search',function(req,res) {

  checkUserIdentity(req.cookies.Authorization,"profile ",function(identity){
    if(identity == "anon user" || identity == "user token expired") {
        res.redirect('../');
    }
    else if(identity == "authenticated user") {
      var ss_usr_id;
      var ss_prof_data;
      var usrname = req.query.username;
      var get_user_info = {
          method: 'POST',
          uri: "http://data.app.hasura.me/v1/query",
          //Add the Header entry with the bearer token
          headers: {
            "Authorization": req.cookies.Authorization
          },
          body: {
            type: "select",
            args: {
              table: "user_stats",
              columns: ["*"],
              where: {username: usrname }
            }
          },
          json: true // Automatically stringifies the body to JSON
      }

      if(usrname == req.cookies.userName) {
        res.redirect('profile');
      }

      else {
      rp(get_user_info).then(function(response){
        ss_prof_data = response[0];
        if(response.length){
        var follow_info = {
            method: 'POST',
            uri: "http://data.app.hasura.me/v1/query",
            //Add the Header entry with the bearer token
            headers: {
              "Authorization": req.cookies.Authorization
            },
            body: {
              type: "select",
              args: {
                table: "following_info",
                columns: ["*"],
                where: {user_id: req.cookies.userId , following_id: ss_prof_data.id}
              }
            },
            json: true // Automatically stringifies the body to JSON
        }
        //make another request to find if the user already follows this user or not
        rp(follow_info).then(function(resp){
          if(resp.length == 1) {
            ss_prof_data.follows = true
            var ss_img_data = [];
            //This user follows searched user show this user his images
            if(ss_prof_data.posts) {
              //user has some posts
              var ss_images_req = {
                  method: 'POST',
                  uri:"http://data.app.hasura.me/v1/query",
                  headers: {
                    "Authorization": req.cookies.Authorization
                  },
                  body: {
                    type: "select",
                    args: {
                      table: "photo",
                      columns: ["id","content"],
                      where: {poster_id: ss_prof_data.id }
                    }
                  },
                  json: true
              };

              rp(ss_images_req).then(function(response){
                console.log("This is image response for searched user");
                response.forEach(function(susrimg){
                  ss_img_data.push(susrimg);
                });
                console.log(ss_img_data);
                res.render('ss_user_prof',{logged_in: true, data: ss_prof_data, ss_images: ss_img_data});
              })
              .catch(function(err){
                console.log(err);
              });
            }
            else{
              res.render('ss_user_prof',{logged_in: true, data: ss_prof_data, no_images: true});
            }

          }
          else {
            ss_prof_data.follows = false;
            res.render('ss_user_prof',{logged_in: true, data: ss_prof_data, no_follow: true});
          }
        })
          .catch(function(err) {
              console.log("Error for follow-info----------------------------------");
              console.log(err);
          });
        } //end if(response.length)
        else {
          //No user found with the given username
          res.cookie("searchUserNotFound",true);
          res.redirect('back');
        }

        })
        .catch(function(err) {
          console.log("Error for get-user-stats----------------------------------");
          console.log(err);
        });

      } //end else

    } //end authenticated user
  }); //end checkUserIdentity


}); //end /search route


router.get('/logout',function(req,res,next){
  //Perform the logout request to auth endpoint and then set appt flags and then redirect
  var logout = {
      method: 'POST',
      uri: "http://auth.app.hasura.me/user/logout",
      //Add the Header entry with the bearer token
      headers: {
        "Authorization": req.cookies.Authorization
      },
      json: true // Automatically stringifies the body to JSON
    };

  rp(logout).then(function(response){
    //succesfully logged out user
    console.log(response);
    res.clearCookie("Authorization");
    res.clearCookie("userId");
    res.clearCookie("userName");
    res.clearCookie("searchUserNotFound");
    //redirect to home page of application
    res.redirect('../');
  })
  .catch(function(err){
    //there was some error logging out the user
    console.log(err);
  });

});

function checkUserIdentity(authToken,from,callback) {
  //check for user identity and then redirect accordingly
  if( typeof authToken != "undefined") {
    //cookie present,now check for if user with this cookie is present
    var token = authToken.split(" ");
    var user_info = {
        method: 'GET',
        uri: "http://auth.app.hasura.me/user/account/info",
        //Add the Header entry with the bearer token
        headers: {
          "Authorization": authToken
        },
        json: true // Automatically stringifies the body to JSON
      };

    rp(user_info).then(function(response){
      //token[1] contains the actual token value
      if(response.auth_token == token[1]) {
        //Cookie matches,now send user to his home page.
        console.log("Response from: " + from + " authenticated user");
        callback("authenticated user");
        //res.redirect("../user_home");
      }

      else {
        console.log("Response from: " + from + " Token expired");
        callback("user token expired");
      }

    })
    .catch(function(err){
      //user with this cookie does not exists
      console.log(err);
    });
  }
  else {
    // no cookie found
    console.log("Response from: " + from + " No cookie found");
    //res.render('index', { active_home: false});
    callback("anon user");
  }
}

module.exports = router;
