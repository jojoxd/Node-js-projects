// this contains all loops

function Announcements(){
	if(variables.announcements.firstRun){
		// check if it's the first run, if so, set delay to 0 to run at startup
		variables.announcements.firstRun = false;
		variables.announcements.delay = 0;
	}
	
	setTimeout(function(){
		// main announcements loop
		
		$.get('./announcements.txt', function(data){
			if(data == ''){
				// data is empty
				JojoLib.out.log("ANNOUNCEMENTS", "No Announcements");
				if(variables.announcements.had_announcement){
					// it had an announcement, but not any more
					$('.announcementsMarquee')
					 .marquee()
					 .fadeOut()
					 .marquee('destroy')
					 .html("<p class='txt-margins announcements'>no announcements!</p>")
					 .marquee()
					.fadeIn();
					
					variables.announcements.had_announcement = false;
				}
				else{
					// nothing changed
				}
			}
			else{
				JojoLib.out.log("ANNOUNCEMENTS", "Got Announcements: \n" + data);
				
				// check if cache is the same as this data
				if(data == variables.announcements.cache){
					// the data is the same, do nothing
				}
				else{
					// the data is different
					variables.announcements.cache = data;
					variables.announcements.had_announcement = true;
					
					JojoLib.out.log("setting announcements!");
					
					$('.announcementMarquee')
					 .marquee()
					 .fadeOut()
					 .marquee('destroy')
					 .html("<p class='txt-margins announcements'>" + data + "</p>")
					 .marquee()
					.fadeIn();
				}
			}
			Announcements();
		});
	}, 1000 * variables.announcements.delay);
	variables.announcements.delay = variables.announcements.normal_delay;
}

function VLC(){
	if(variables.vlc.firstRun){
		// check if it's the first run, if so, set delay to 0 to run at startup
		variables.vlc.firstRun = false;
		variables.vlc.delay = 0;
	}
	
	setTimeout(function(){
		// main vlc loop
		
		variables.socket.emit('wantVLCstatus');
		
		VLC();
	}, 1000 * variables.vlc.delay);
	variables.vlc.delay = variables.vlc.normal_delay;
}

variables.socket.on('VLCSTATUS', function(data){
	JojoLib.out.log("VLCSTATUS", "got vlc status [" + data.state + "]", "SOCKET.IO");
	
	// check status:
	if(data.state == "paused" || data.state == "stopped"){
		// the music stopped / is paused
		
		if(variables.vlc.state == data.state){
			// vlc was already stopped/paused last time we checked, do nothing
		}
		else{
			$('.vlcMarquee')
			 .marquee()
			 .fadeOut()
			 .marquee('destroy')
			 .html("<p class='txt-margins music'><span class='state'>[" + data.state + "]</span></p>")
			 .marquee()
			.fadeIn();
			variables.vlc.state = data.state;
		}
		
	}
	else if(data.state == "playing"){
		// check for cache
		if( variables.vlc.cache.name == data.information.category.meta.title && variables.vlc.cache.artist == data.information.category.meta.artist ){
			// everything is the same, do not change
		}
		else{
			// something changed
			
			// resetting marquee:
			
			$('.vlcMarquee')
			 .marquee()
			 .fadeOut()
			 .marquee('destroy')
			 .html("<p class='txt-margins music'><span class='name'>" + data.information.category.meta.title + "</span> - <span class='artist'>" + data.information.category.meta.artist + "</span></p>")
			 .marquee()
			.fadeIn();
			
			
			JojoLib.out.log(data.information.category.meta.title);
			JojoLib.out.log(data.information.category.meta.artist);
			
			// set vlc cache
			variables.vlc.cache.name = data.information.category.meta.title;
			variables.vlc.cache.artist = data.information.category.meta.artist;
			variables.vlc.state = data.state;
		}
	}
});

function spotify(){
	if(variables.spotify.firstRun){
		// check if it's the first run, if so, set delay to 0 to run at startup
		variables.spotify.firstRun = false;
		variables.spotify.delay = 0;
	}
	
	setTimeout(function(){
		// spotify loop
		variables.socket.emit('wantSpotifyStatus');
		
		spotify();
	}, 1000 * variables.spotify.delay);
	variables.spotify.delay = variables.spotify.normal_delay;
}

variables.socket.on('spotifyStatus', function(data){
	if(data.state == "playing"){
		JojoLib.out.log("spotify<" + data.state + ">: " + data.track + " - " + data.artist);
		if(variables.spotify.state == data.state){
			//check if it is the same song
			if(data.track == variables.spotify.cache.name && data.artist == variables.spotify.cache.artist){
				// do nothing
			}
			else {
				// the song changed
				$('.SpotifyMarquee')
				 .marquee()
				 .fadeOut()
				 .marquee('destroy')
				 .html("<p class='txt-margins music'><span class='name'>" + data.track + "</span> - <span class='artist'>" + data.artist + "</span></p>")
				 .marquee()
				.fadeIn();
			}
			variables.spotify.cache.name = data.track;
			variables.spotify.cache.artist = data.artist;
			variables.spotify.state = data.state;
		}
		else{
			variables.spotify.state = data.state;
		}
		
		
	}
	else if(data.state == "paused"){
		if(data.state == variables.spotify.state){
			// the state didn't change
		}
		else{
			JojoLib.out.log("Spotify is paused!");
			$('.SpotifyMarquee')
			 .marquee()
			 .fadeOut()
			 .marquee('destroy')
			 .html("<p class='txt-margins music'>[paused]</p>")
			 .marquee()
			.fadeIn();
			variables.spotify.state = data.state;
		}
	}
	else {
		variables.spotify.state = data.state;
		JojoLib.out.log(data.state);
	}
});