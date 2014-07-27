var settings = {
	PORT: 81,
	DIR: 'www',
	
	vlc: {
		username: '',
		password: '1234',
		PORT: 8080,
		HOST: '127.0.0.1',
		resource: '/requests/status.json',
		requestNo: 0,
	},
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

app.get('/vlc/status', function(req, res){
	JojoLib.out.log("APPGET", "got request!", "/vlc/status");
	
	var cbURL = stripURL(req.url);
	if(typeof cbURL.callback != 'undefined'){
		JojoLib.out.log("APPGET", "got callback! ( " + cbURL.callback + " )", "/vlc/status");
		//res.write(cbURL.callback);
	}
	
	var requestURL = url.resolve('http://' + settings.vlc.HOST + ":" + settings.vlc.PORT, settings.vlc.resource);
	
	var auth = getAuthHeaderArray(settings.vlc.username, settings.vlc.password);
	
	JojoLib.out.log("APPGET", "making request", "/vlc/status");
	
	request.get(requestURL, function(error, response, body){
		if(error && response.statusCode != 200){
			// error handling here!
			JojoLib.out.warn(error);
		}
		else{
			JojoLib.out.log("APPGET", "sending response!", "/vlc/status");
			//res.write(response.body);
			res.end();
			
			settings.vlc.requestNo++;
			
			JojoLib.out.log("APPGET", "response sent! ( " + settings.vlc.requestNo + " )", "/vlc/status");
		}
	}).auth(settings.vlc.username, settings.vlc.password, false);
	
});

/*	SocketIO stuff				*/
io.on('connection', function(socket){
	
	vars.socketCount++;
	
	JojoLib.out.log("io", "a socket has connected [sockets connected: " + vars.socketCount + "]", "SOCKET.IO");
	
	socket.on('disconnect', function(){
		vars.socketCount--;
		JojoLib.out.log("io", "a socket has disconnected [sockets connected: " + vars.socketCount + "]", "SOCKET.IO");
	});
	
	socket.on('wantVLCstatus', function(data){
		var requestURL = url.resolve('http://' + settings.vlc.HOST + ":" + settings.vlc.PORT, settings.vlc.resource);
		request.get(requestURL, function(error, response, body){
			if(error && response.statusCode != 200){
				// error handling here!
				JojoLib.out.warn(error);
			}
			else{
				JojoLib.out.log("APPGET", "sending response!", "/vlc/status");
				
				socket.emit('VLCSTATUS', JSON.parse(response.body));
				
				JojoLib.out.log("wantVLCstatus", "A socket wants VLC status", "SOCKET.IO");
			}
		}).auth(settings.vlc.username, settings.vlc.password, false);
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