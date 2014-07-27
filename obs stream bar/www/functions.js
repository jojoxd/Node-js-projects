var variables = {
	svgElements: {
		spacer: {
			right: '<svg width="75" height="50" style="background-color: transparent" ><ellipse cx="0" cy="0" rx="60" ry="50" style="fill:black" /><ellipse cx="0" cy="0" rx="58" ry="48" style="fill:red" /></svg>',
		},
	},
	
	announcements: {
		enabled: true,
		firstRun: true,
		normal_delay: 30, // normal delay in seconds
		delay: 30, // will change during startup
		had_announcement: false, // if announcements had an announcement, fade away when it doesn't any more
		cache: '',
	},
	
	vlc: {
		enabled: true,
		firstRun: true,
		normal_delay: 10, // normal delay in seconds
		delay: 10, // will change during startup
		cache: {
			artist: "none",
			name: "none",
		},
		state: "unknown",
	},
	
	// socket.io socket
	socket: io.connect(),
};

function setSpacers(){
	// set spacers to SVG elements
	$('.spacer').html(variables.svgElements.spacer.right);
}

function setMarquee(){
	// makes the marquees move
	$('.marquee').marquee();
}

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
					$('#announcementsMarquee')
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
					
					$('#announcementMarquee')
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
	JojoLib.out.log("VLCSTATUS", "got vlc status", "SOCKET.IO");
	
	// check status:
	if(data.state == "stopped" || data.state == "paused"){
		// the music stopped / is paused
		JojoLib.out.log("VLC has " + data.state + "!");
		
		if(variables.vlc.state == data.state){
			// vlc was already stopped/paused last time we checked, do nothing
		}
		else{
			$('#vlcMarquee')
			 .marquee()
			 .fadeOut()
			 .marquee('destroy')
			 .html("<p class='txt-margins music'><span class='state'>[" + data.state + "]</span></p>")
			 .marquee()
			.fadeIn();
		}
		
		
		variables.vlc.state = data.state;
		
	}
	else if(data.state == "playing"){
		// check for cache
		if( variables.vlc.cache.name == data.information.category.meta.title && variables.vlc.cache.artist == data.information.category.meta.artist ){
			// everything is the same, do not change
		}
		else{
			// something changed
			
			// resetting marquee:
			
			$('#vlcMarquee')
			 .marquee()
			 .fadeOut()
			 .marquee('destroy')
			 .html("<p class='txt-margins music'><span class='name'>" + data.information.category.meta.title + "</span> - <span class='artist'>" + data.information.category.meta.artist + "</span></p>")
			 .marquee()
			.fadeIn();
			
			
			JojoLib.out.log(data.information.category.meta.title);
			JojoLib.out.log(data.information.category.meta.artist);
			
			//$('#musicMarquee').toggleClass('marquee');
			
			// set vlc cache
			variables.vlc.cache.name = data.information.category.meta.title;
			variables.vlc.cache.artist = data.information.category.meta.artist;
		}
	}
});

function testForFollowers(){
	$.get("./latestFollower.txt", function(data){
		if(data != ""){
			// the data in latestFollower.txt is a follower
			newFollower(data);
		}
	});
}

function run(){
	setSpacers();
	setMarquee();
	testForFollowers();
	Announcements();
	VLC();
}

// run wrapper (anon function)
$(document).ready(function(){
	run();
});