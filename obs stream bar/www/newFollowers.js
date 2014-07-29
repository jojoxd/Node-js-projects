/* Thanks @nightdev for this code! */

var followers = {};

      function grabFollowers(all, offset) {
        all = all || false;
        offset = offset || 0;
        if(all) {
          $.getJSON('https://api.twitch.tv/kraken/channels/'+encodeURIComponent(getParameterByName("channel"))+'/follows?direction=desc&limit=100&offset='+offset+'&callback=?', function(data) {
            if(data.follows && data.follows.length > 0) {
              data.follows.forEach(function(follower) {
                followers[follower.user.name] = true;
              });
              grabFollowers(true, offset+100);
            }
          }).fail(function() {
            setTimeout(function() {
              grabFollowers(true, offset);
            }, 5000);
          });
        } else {
          $.getJSON('https://api.twitch.tv/kraken/channels/'+encodeURIComponent(getParameterByName("channel"))+'/follows?direction=desc&limit=100&callback=?', function(data) {
            if(data.follows) {
              if(data['_total'] > 0 && followers.length === 0) {
                data.follows.forEach(function(follower) {
                  followers[follower.user.name] = true;
                });
              } else {
                data.follows.forEach(function(follower) {
                  if(!followers[follower.user.name]) {
                    followers[follower.user.name] = true;
                    newFollower(follower.user.display_name);
                  }
                });
              }
            }
          });
        }
      }

      function resizeName() {
        while($('#follower-alert .text')[0].scrollWidth > $('#follower-alert .text').width()+5) {
          var currentSize = parseInt($("#follower-alert .text").css("font-size").replace("px",""));
          $("#follower-alert .text").css("font-size", (currentSize-1)+"px");
        }
      }

      var timer = false;
      var alertSound = false;
	  var firstRunNewFollower = true;
	  
      function newFollower(user) {
        if(timer) {
          setTimeout(function() {
            newFollower(user);
          }, 1000);
          return;
        }
		/* new functions: */
		$(document).ready(function(){
			
			JojoLib.out.log("@" + user + " has followed you!");
			
			// request socket.io to change the latestFollower.txt
			variables.socket.emit("setLatestFollower", user);
			
			$('.followerMarquee')
			 .marquee()
			 .fadeOut()
			 .marquee('destroy')
			 .html('<p id="newFollower" class="txt-margins"><span id="followerAlert">Thanks for following @</span><span id="NewUser">' + user + '</span></p>')
			 .marquee()
			.fadeIn();
		});
		
		
		
		/*
        if(alertSound) alertSound.play();
        $("#new-follower").html(user);
        $("#follower-alert .text").css("font-size", "45px");
        if(getParameterByName("chroma") === "true") {
          $("#follower-alert").show();
          $("#follower-alert")[0].style.top = -parseInt($("#follower-alert").height());
          $("#follower-alert").animate({
            top: 0
          }, 300, function() {
            resizeName();
          });
          timer = setTimeout(function() {
            $("#follower-alert").animate({
              top: -parseInt($("#follower-alert").height())
            }, 1000, function() {
              $("#follower-alert").hide();
              timer = false;
            });
          }, 10000);
        } else {
          $("#follower-alert").fadeIn("slow", function() {
            resizeName();
          });
          timer = setTimeout(function() {
            $("#follower-alert").fadeOut("slow", function() {
              timer = false;
            });
          }, 10000);
        }
		*/
      }

      function getParameterByName(name) {
		if(name === "channel"){
			return "jojoxd2";
		}
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
      }

      $(document).ready(function() {
        grabFollowers(true);
        if(getParameterByName("chroma") === "true") {
          $("body").css("background-color","#00ff00");
        }

        var channel = getParameterByName("channel"),
            type = getParameterByName("type"),
            alert = getParameterByName("alert"),
            sound = false;

        if(channel) {
          setInterval(grabFollowers, 60000);

          if(type === "stacked" || type === "custom-centered") {
            $('#follower-alert .text').css({
              'margin-left':'15px',
              'width':'550px'
            });
          }

          if(type === "custom-left") {
            $('#follower-alert .text').css({
              'margin-left':'25px'
            });
          }

          if(alert) {
            $('#follower-alert').css('background-image','url('+decodeURIComponent(alert)+')');
          }

          if(sound) {
            alertSound = new Audio(decodeURIComponent(sound));
            alertSound.addEventListener("loadeddata", function() {
              if(getParameterByName("preview") === "true") {
                newFollower("Test_user");
              }
            });
          } else {
            if(getParameterByName("preview") === "true" || JojoLib.settings.debug) {
              newFollower("Test_user");
            }
          }
        }
      });