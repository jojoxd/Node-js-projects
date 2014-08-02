// this will run first

var settings = 'none';

function setClientSettings(data){
	settings = data;
	setupClient();
}

function setupClientSettings(){
	variables.socket.emit('getClientSettings');
	
	variables.socket.on('ClientSettings', function(data){
		setClientSettings(data);
	});
}

function setupClient(){
	if(settings.debug){
		JojoLib.out.log('got ClientSettings');
	}
	
	conf = settings.setup.split(",");
	
	for(var x = 0; x < conf.length; x++){
		length = conf[x].split("-");
		
		JojoLib.out.log("the length of element {" + length[1] + "} == " + length[0]);
		
		// renderBar( length, what );
		renderBar(length[0], length[1]);
		
	}
	
	JojoLib.core.sendEvent('doneLoading');
	
}

function renderBar(length, what){
	var classes = "";
	
	// setting length class
	if(length == "1/6"){
		if(what == "spacer"){
			classes += "spacerOneSixth ";
		}
		else {
			classes += "oneSixth ";
		}
	}
	else if(length == "1/3"){
		if(what == "spacer"){
			classes += "spacerOneThird ";
		}
		else{
			classes += "oneThird ";
		}
	}
	else{
		JojoLib.out.log("no length specified! (defaulting to 1/6)");
		classes += "oneSixth ";
	}
	
	// this would be nicer in a case statement
	if(what == "announcements"){
		render.announcements(classes, length);
	}
	else if(what == "vlc"){
		render.vlc(classes, length);
	}
	else if(what == 'followers'){
		render.followers(classes, length);
	}
	else if(what == "spotify"){
	 render.spotify(classes, length);	
	}
	else if(what == "subscribers"){
		render.subscribers(classes, length);
	}
	else if(what == 'spacer'){
		render.spacer(classes, length);
	}
	else {
		// nothing...
	}
}

function setupClientWrapper(){
	JojoLib.out.log("getting settings!");
	setupClientSettings();
}

function testForFollowers(){
	$.get("./latestFollower.txt", function(data){
		if(data != ""){
			// the data in latestFollower.txt is a follower
			newFollower(data);
		}
	});
}



/* the rendering will be done through these functions */

var render = {
	// just a bunch of jquery appends
	announcements: function(classes, length){
		JojoLib.out.log("adding Announcements bar with length " + length[0]);
		$('.container').append("<!-- Announcements <" + length[0] + "> -->");
		$('.container').append("<div class='marqueeContainer inline " + classes + "'><div class='announcementMarquee marquee'><p class='txt-margins announcements'>Announcements: none</p></div></div><div class='spacer inline'></div>");
	},
	
	vlc: function(classes){
		JojoLib.out.log("adding vlc bar with length " + length[0]);
		$('.container').append("<!-- VLC <" + length[0] + "> -->");
		$('.container').append("<div class='marqueeContainer inline " + classes + "'><div class='vlcMarquee marquee'><p class='txt-margins music'><span class='name'></span> - <span class='artist'></span></p></div></div><div class='spacer inline'></div>");
	},
	
	spotify: function(classes){
		JojoLib.out.log("adding spotify bar with length " + length[0]);
		$('.container').append("<!-- Spotify <" + length[0] + "> -->");
		$('.container').append("<div class='marqueeContainer inline " + classes + "'><div class='SpotifyMarquee marquee'><p class='txt-margins music'><span class='name'></span> - <span class='artist'></span></p></div></div><div class='spacer inline'></div>");
	},
	
	followers: function(classes){
		JojoLib.out.log("adding follower bar with length " + length[0]);
		$('.container').append("<!-- Followers <" + length[0] + "> -->");
		$('.container').append("<div class='marqueeContainer inline " + classes + "'><div class='followerMarquee marquee'><p id='newFollower' class='txt-margins'><span id='followerAlert'>nobody followed me yet :(</span><span id='newUser'></span></p></div></div><div class='spacer inline'></div>");
	},
	
	subscribers: function(classes){
		// not implemented yet!
	},
	
	spacer: function(classes){
		JojoLib.out.log("adding spacer with length " + length[0]);
		$('.container').append("<!-- Spacer <" + length[0] + "> -->");
		$('.container').append("<div class='inline " + classes + "'></div>");
	},
}