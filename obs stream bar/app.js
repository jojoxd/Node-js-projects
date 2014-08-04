var settings = {
	PORT: 81,
	DIR: 'www',
	
	stream: {
		channel: "yourChannelName",
	},
	
	vlc: {
		username: '', // leave empty! (vlc does not use the username field -_-')
		password: '1234', // password you put in your vlc
		PORT: 8080,
		HOST: '127.0.0.1',
		resource: '/requests/status.json', // DO NOT TOUCH THIS, k thnx
		enabled: true, // disable if you do not use vlc as music player
	},
	
	donationTracker: { // not implemented yet...
		enabled: true,
		file: "C:/path/to/donation/tracker.txt",
	},
	
	subTracker: { // not implemented yet...
		// enable if you are a partnered streamer!
		enabled: true,
	},
	
	spotify: {
		// note: you could get into trouble with twitch/ other streaming services if you add copyrighted sounds! use with caution!
		enabled: true,
	},
};

var ClientSettings = {
	setup: "1/6-followers,1/6-announcements,1/3-spacer,1/6-spotify,1/6-vlc",
	debug: true,
};


var vars = {
	socketCount: 0,
	VLCReq: 0,
	spotifyReq: 0,
}

// header: 
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var url = require('url');
var util = require('util');
var request = require('request');
var JojoLib = require('JojoLib');
var fs = require('fs');
var irc = require('irc');
var nodeSpotifyWebHelper = require('node-spotify-webhelper');
var spotify = new nodeSpotifyWebHelper.SpotifyWebHelper();

app.use(express.static(settings.DIR));


var getAuthHeaderArray = function(username, password){
	var authHeaderBase64 = util.format('Basic %s',
		new Buffer(username + ':' + password).toString('base64')
	);
	return ['Authorization', authHeaderBase64];
}

var setupSettings = function(){
	
}

setupSettings();

var stripURL = function(URL){
	strippedURL = url.parse(URL, true);
	var query = strippedURL.query;
	return query;
}

server.listen(settings.PORT, function(){
	// makes the server listen on the configured port
	JojoLib.out.log("SERVER", "Running on port #" + settings.PORT, "HTTP");
});

app.get('/status/spotify.json', function(req, res){
	spotify.getStatus(function(err, resp){
		res.send(resp);
	});
});

app.get('/status/vlc.json', function(req, res){
	var requestURL = url.resolve('http://' + settings.vlc.HOST + ":" + settings.vlc.PORT, settings.vlc.resource);
	request.get(requestURL, function(error, response, body){
		if(error){
			res.send({"state": "not running!", "version": "version: I Don't know yet"});
		}
		else{
			res.send(response.body);
		}
	}).auth(settings.vlc.username, settings.vlc.password, false);
});

app.get('/status/vars.json', function(req, res){
	res.send({"connected_sockets": vars.socketCount, "vlcRequests": vars.VLCReq, "spotifyRequests": vars.spotifyReq});
});

/*	SocketIO stuff				*/
io.on('connection', function(socket){
	
	vars.socketCount++;
	
	JojoLib.out.log("io", "a socket has connected [sockets connected: " + vars.socketCount + "]", "SOCKET.IO");
	
	socket.on('disconnect', function(){
		vars.socketCount--;
		JojoLib.out.log("io", "a socket has disconnected [sockets connected: " + vars.socketCount + "]", "SOCKET.IO");
	});
	
	socket.on('getChannelName', function(){
		socket.emit('channelName', settings.stream.channel);
	});
	
	// send client setup info
	socket.on('getClientSettings', function(){
		JojoLib.out.log("getClientSettings", "A socket wants settings!", "SOCKET.IO");
		socket.emit('ClientSettings', ClientSettings);
	});
	
	socket.on('wantVLCstatus', function(data){
		vars.VLCReq++;
		if(settings.vlc.enabled){
			JojoLib.out.log("wantVLCstatus", "A socket wants VLC status", "SOCKET.IO");
			var requestURL = url.resolve('http://' + settings.vlc.HOST + ":" + settings.vlc.PORT, settings.vlc.resource);
			request.get(requestURL, function(error, response, body){
				if(error){
					// error handling here!
					JojoLib.out.warn(error);
					socket.emit("VLCSTATUS", {state: "<b>VLC Has <i>errored</i>! do you have it on/ do you have the HTTP server enabled?</b>"})
				}
				else{
					JojoLib.out.log("APPGET", "sending response!", "/vlc/status");
					
					socket.emit('VLCSTATUS', JSON.parse(response.body));
					
				}
			}).auth(settings.vlc.username, settings.vlc.password, false);
		}
		else{
			// vlc is not enabled
			socket.emit('VLCSTATUS', {state: "<b>no vlc enabled!</b>"});
		}
	});
	
	socket.on('wantSpotifyStatus', function(){
		vars.spotifyReq++;
		spotify.getStatus(function (err, res){
			if(err) {
				JojoLib.out.log(err);
				socket.emit('spotifyStatus', {artist: "", track: "", state: "something went wrong! (" + err + ")"});
			}
			else{
				if(res.running){
					if(res.playing){ state = "playing"; }
					else{ state = "paused"; }
					JojoLib.out.log("spotify: [" + state + "] " + res.track.track_resource.name + " - " + res.track.artist_resource.name);
					socket.emit('spotifyStatus', {artist: res.track.artist_resource.name, track: res.track.track_resource.name, state: state});
				}
				else{
					// spotify isn't running!
					socket.emit('spotifyStatus', {artist: "", track: "", state: "<b>spotify isn't running!<b>"});
				}
			}
		});
	});
	
	socket.on('setLatestFollower', function(data){
		fs.writeFile("./www/latestFollower.txt", data, function(err){
			if(err){
				console.log(err);
			}
			else{
				JojoLib.out.log("wrote <" + data + "> to ./www/latestFollower.txt");
			}
		});
	});	
});