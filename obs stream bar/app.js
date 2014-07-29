var settings = {
	PORT: 81,
	DIR: 'www',
	
	vlc: {
		username: '', // leave empty!
		password: '1234', // password you put in your vlc
		PORT: 8080,
		HOST: '127.0.0.1',
		resource: '/requests/status.json',
		enabled: true, // disable if you do not use vlc as music player
	},
};

var ClientSettings = {
	setup: "1/6-followers,1/3-announcements,1/3-spacer,1/6-vlc",
	debug: true,
};


var vars = {
	socketCount: 0,
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

app.use(express.static(settings.DIR));


var getAuthHeaderArray = function(username, password){
	var authHeaderBase64 = util.format('Basic %s',
		new Buffer(username + ':' + password).toString('base64')
	);
	return ['Authorization', authHeaderBase64];
}

var stripURL = function(URL){
	strippedURL = url.parse(URL, true);
	var query = strippedURL.query;
	return query;
}

server.listen(settings.PORT, function(){
	// makes the server listen on the configured port
	JojoLib.out.log("SERVER", "Running on port #" + settings.PORT, "HTTP");
});

/*	SocketIO stuff				*/
io.on('connection', function(socket){
	
	vars.socketCount++;
	
	JojoLib.out.log("io", "a socket has connected [sockets connected: " + vars.socketCount + "]", "SOCKET.IO");
	
	socket.on('disconnect', function(){
		vars.socketCount--;
		JojoLib.out.log("io", "a socket has disconnected [sockets connected: " + vars.socketCount + "]", "SOCKET.IO");
	});
	
	// send client setup info
	socket.on('getClientSettings', function(){
		JojoLib.out.log("getClientSettings", "A socket wants settings!", "SOCKET.IO");
		socket.emit('ClientSettings', ClientSettings);
	});
	
	socket.on('wantVLCstatus', function(data){
		if(settings.vlc.enabled){
			JojoLib.out.log("wantVLCstatus", "A socket wants VLC status", "SOCKET.IO");
			var requestURL = url.resolve('http://' + settings.vlc.HOST + ":" + settings.vlc.PORT, settings.vlc.resource);
			request.get(requestURL, function(error, response, body){
				if(error && response.statusCode != 200){
					// error handling here!
					JojoLib.out.warn(error);
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
	})
	
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