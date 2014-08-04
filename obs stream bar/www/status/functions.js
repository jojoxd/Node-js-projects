$.getJSON('/status/vlc.json', function(data){
	$('.vlcVersion').append(data.version);
	$('.vlcInfo').append("state: " + data.state + "<br>");
	if(data.state == "playing"){
		$('.vlcInfo').append("number: " + data.information.category.meta.title + " by " + data.information.category.meta.artist + "<br>");
	}
	$('.vlcInfo').append("<br><br>");
});

$.getJSON('/status/spotify.json', function(data){
	$('.spotifyVersion').append(data.client_version);
	$('.spotifyInfo').append("running: " + data.running + "<br>");
	if(data.running){
		if(data.playing){
			$('.spotifyInfo').append("state: playing<br>");
		}
		else{
			$('.spotifyInfo').append("state: paused/stopped<br>");
		}
		
		$('.spotifyInfo').append("number: " + data.track.track_resource.name + " by " + data.track.artist_resource.name + "<br>");
	}
});

$.getJSON('/status/vars.json', function(data){
	$('.vlcInfo').append("times requested: " + data.vlcRequests + "<br>");
	$('.spotifyInfo').append("times requested: " + data.spotifyRequests + "<br>");
	$('.connection').append("connected sockets: " + data.connected_sockets + "<br>");
});

