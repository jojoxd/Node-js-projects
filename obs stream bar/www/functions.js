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
	
	spotify: {
		enabled: true,
		firstRun: true,
		normal_delay: 10, // normal delay in seconds
		delay: 10, // will change during startup
		cache: {
			artist: "none",
			name: "none",
		},
		state: "good",
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

function run(){
	setupClientWrapper();
	$(document).on('doneLoading', function(){
		// the ClientSettings are now available!
		setSpacers();
		setMarquee();
		testForFollowers();
		Announcements();
		VLC();
		spotify();
	});
}

// run wrapper
$(document).ready(function(){
	run();
});