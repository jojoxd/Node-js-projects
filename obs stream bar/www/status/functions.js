var delay = 0;
function loop(){
	setTimeout(function(){
		$.getJSON('/status/vars.json', function(data){
			$('.vlc_requests').html("times requested: " + data.vlcRequests + "<br>");
			$('.spotify_requests').html("times requested: " + data.spotifyRequests + "<br>");
			$('.socket_connected').html(data.connected_sockets);
		});
		
		$.getJSON('/status/vlc.json', function(data){
			$('.vlcVersion').html(data.version);
			$('.vlc_state').html(data.state);
			if(data.state == "playing"){
				$('.vlc_number').html("number: " + data.information.category.meta.title + " by " + data.information.category.meta.artist);
			}
		});
		
		$.getJSON('/status/spotify.json', function(data){
			$('.spotifyVersion').html(data.client_version);
			$('.spotify_running').html(data.running);
			if(data.running){
				if(data.playing){
					$('.spotify_state').html("playing");
				}
				else{
					$('.spotify_state').html("paused/stopped");
				}
				$('.spotify_number').html("number: " + data.track.track_resource.name + " by " + data.track.artist_resource.name);
			}
		});
		loop();
	}, 1000 * delay);
	delay = 10;
}

loop();