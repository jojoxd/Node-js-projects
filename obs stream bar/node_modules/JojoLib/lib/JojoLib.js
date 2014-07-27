/*	JojoLib:										||
||	Licensed under LGPL v3							||
||	Source: https://github.com/jojoxd/jojolib-js	||
||	Untested in IE	--	Requires jQuery & Bootstrap	*/

console.log("[JojoLib] [INIT]: Started");
var startTime = new Date();

// namespace: 
module.exports = {
	_postInit: function(){
		// postInit stuff here:
		
		// Calculate how quick init was:
		var endTime = new Date();
		var diff = endTime - startTime;
		this.out.log("INIT", "Completed after " + diff + " ms");
		diff = null; startTime = null; endTime = null; // so you can use these variables in your script
		
		this.out.log("POSTINIT", "Started");
		// version check:
		//this._core.versionCheck();
		
		// define Errors:
		this.error.undefinedError.prototype = new Error();
		this.error.undefinedError.prototype.constructor = this.error.undefinedError;
		
		// fixes and stuff:
		this.thirdParty.fixes();
		
		this.out.log("POSTINIT", "Complete");
	},
	
	out: {
		log: function(prefix, text, namespace){
			// how it looks in console: [<namespace>] [<prefix>]: <text> || [JojoLib] [<prefix>]: <text> || [JojoLib]: <prefix>
			if(typeof namespace === 'undefined'){namespace = "JojoLib";}
			
			if(typeof text === 'undefined'){
				console.log("[" + namespace + "]: " + prefix);
			}
			else{
				console.log("[" + namespace + "] [" + prefix + "]: " + text);
			}
		},
		
		warn: function(prefix, text, namespace){
			// how it looks in console: ![<namespace>] [<prefix>]: <text> || ![JojoLib] [<prefix>]: <text> || ![JojoLib]: <prefix>
			if(typeof namespace === 'undefined'){namespace = "JojoLib";}
			
			if(typeof text === 'undefined'){
				console.warn("[" + namespace + "]: " + text);
			}
			else{
				console.warn("[" + namespace + "] [" + prefix + "]: " + text);
			}
		},
		
		todo: function(text, namespace){
			// how it looks in console: [<namespace>] [TODO]: <text> || [JojoLib] [TODO]: <text>
			if(typeof namespace === 'undefined'){namespace = "JojoLib";}
			
			console.log("[" + namespace + "] [TODO]: " + text);
		},
		
		// will only run if JojoLib.settings.debug = true;
		debug: function(prefix, text, namespace){
			// how it looks in console: [<namespace>] [DEBUG [<prefix>]]: <text> || [JojoLib] [DEBUG [<prefix>]]: <text> || [JojoLib] [DEBUG]: <prefix>
			if(JojoLib.settings.debug){
				if(typeof namespace === 'undefined'){namespace = "JojoLib";}
				
				if(typeof text === 'undefined'){
					this.out.log("DEBUG", prefix, namespace);
				}
				else{
					this.out.log("DEBUG [" + prefix + "]", text, namespace);
				}
			}
		},
	},
	
	core: {
		sendEvent: function(name){
			emitter = require('events').EventEmitter;
			emitter.emit(name);
		},
		
		sendEvent_fn: function(name, fn){
			emitter = require('events').EventEmitter;
			emitter.emit(name, fn);
		}
	},
	
	_core: {
		versionCheck: function(){
			if(JojoLib.settings.version.versionCheck){
				var renderChangelog = false;
				var thisVersion = JojoLib._vars.version;
				$.get('http://jojoxd.nl/JojoLib/newestVersion.php', function(data){
					var comparison = JojoLib._core.versionCompare("" + thisVersion, "" + data);
					
					if(comparison < 0){
						// new version available
						JojoLib.out.debug("10.1");
						JojoLib.out.log("Version Checker", "There's a new version available! ("+ data +") you are running " + thisVersion);
						if(JojoLib.settings.version.showChangelog){
							JojoLib._core.changelog();
						}
						else{
							JojoLib.out.log("Changelog", "Disabled");
						}
					}
					else if(comparison == 0){
						JojoLib.out.debug("10.2");
						// the versions are equal
						JojoLib.out.log("version Checker", "You are running the latest known version of JojoLib");
					}
					else if(comparison > 0){
						JojoLib.out.debug("10.3");
						// you are running a [DEV|CUSTOM] build of JojoLib
						if(JojoLib.settings.version.isDEV || JojoLib.settings.version.isCUSTOM){
							JojoLib.out.log("Version Checker", "You are running a custom/dev version of JojoLib.");
						}
						else{
							JojoLib.out.log("This version# is not recognized, maybe you are running a newer version that is not available yet");
						}
					}
				});
				
				
			}
			else{
				// version check disabled
			}
		},
		
		versionCompare: function(v1, v2, options){
			// thanks to Jon Papaioannou ( https://gist.githubusercontent.com/TheDistantSea/8021359/raw/0ef72e403ae51c4860cd2af9d4d18f14c1c98b01/version_compare.js )
			var lexicographical = false;
			var zeroExtend = false;
			JojoLib.out.debug("5");
			if(options){
				if(options.lexicographical){
					var lexicographical = true;
				}
				
				if(options.zeroExtend){
					var zeroExtend = true;
				}
			}
			
			JojoLib.out.debug("6");
			var v1parts = v1.split(".");
			var v2parts = v2.split(".");
			
			JojoLib.out.debug("7");
			
			function isValidPart(x) {
				JojoLib.out.debug("8");
				return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
			}

			if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
				return NaN;
			}

			if (zeroExtend) {
				while (v1parts.length < v2parts.length) v1parts.push("0");
				while (v2parts.length < v1parts.length) v2parts.push("0");
			}

			if (!lexicographical) {
				v1parts = v1parts.map(Number);
				v2parts = v2parts.map(Number);
			}
			
			JojoLib.out.debug("9");
			
			for (var i = 0; i < v1parts.length; ++i) {
				if (v2parts.length == i) {
					return 1;
				}

				if (v1parts[i] == v2parts[i]) {
					continue;
				}
				else if (v1parts[i] > v2parts[i]) {
					return 1;
				}
				else {
					return -1;
				}
			}

			if (v1parts.length != v2parts.length) {
				return -1;
			}

			return 0;
		},
	
		changelog: function(){
			$.get('http://jojoxd.nl/JojoLib/changeLog.php', function(data){
				JojoLib.out.log("Changelog:", "\n" + data);
			});
		},
	},
	
	error: {
		undefinedError: function(name, message){
			this.name = "[JojoLib_Undefined_Error] " + name;
			this.message = message || "No message given.";
			this.description = message || "No message given.";
		},
	},
	
	thirdParty: {
		fixes: function(){
			// none yet
		},
	},
	
	_vars: {
		version: "0.5.0",
		loadedLibrary: [],
		core: {
			// no vars in here yet
		},
	},
	settings: {
		// from siteRoot: e.g. if your JojoLib.js is in http://sub.domain.com/js/ you set this to /js/
		
		version: {
			versionCheck: true,
			showChangelog: true,
			isDEV: false,
			isCUSTOM: false,
		},
		
		debug: false,
	},
};