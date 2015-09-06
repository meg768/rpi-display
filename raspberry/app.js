var schedule = require('node-schedule');
var util     = require('util');
var sprintf  = require('./sprintf.js');
var random   = require('./random.js');


// { "command": "python", "options": {"cwd":"python"}, "args": ["run-text.py", "-t", "HEJ", "-c", "blue"]}

function main() {

	var Queue = require('./runqueue.js');

	// Set the time zone according to config settings
	process.env.TZ = 'Europe/Stockholm';
	
	var _process = null;
	var _queue = new Queue();


		
	function enableClock() {
		var rule = new schedule.RecurrenceRule();
	
		rule.minute = new schedule.Range(0, 59, 1);
		rule.second = 30;

		function hslToRgb(h, s, l){
		    
		    var r, g, b;
		
		    if (s == 0){
		        r = g = b = l; // achromatic
		    } else{
		        var hue2rgb = function hue2rgb(p, q, t){
		            if(t < 0) t += 1;
		            if(t > 1) t -= 1;
		            if(t < 1/6) return p + (q - p) * 6 * t;
		            if(t < 1/2) return q;
		            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		            return p;
		        }
		
		        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		        var p = 2 * l - q;
		        r = hue2rgb(p, q, h + 1/3);
		        g = hue2rgb(p, q, h);
		        b = hue2rgb(p, q, h - 1/3);
		    }
		
		    return {red:Math.round(r * 255), green:Math.round(g * 255), blue:Math.round(b * 255)};
		}	
		
		schedule.scheduleJob(rule, function() {

			var now = new Date();
			var hue = ((now.getHours() % 12) * 60 + now.getMinutes()) / 2;
			
			var color = hslToRgb(hue / 360, 1, 0.5);
			
			var msg = {};
			msg.type     = 'text';
			msg.priority = 'low';
			msg.delay    = 30;
			msg.color    = sprintf('rgb(%d,%d,%d)', color.red, color.green, color.blue);
			msg.text     = sprintf('   %02d:%02d   ', now.getHours(), now.getMinutes());
			console.log(msg);

			message(msg);	
		});
	}
	
	function startBackgroundProcess() {

		var now = new Date();
		
		if (!_queue.empty()) {
			return;
		}

		var cmd = {};
		cmd.options = {cwd: 'matrix'}
		
		if (now.getHours() >= 0 && now.getHours() <= 7) {
			cmd.command = './run-rain';
			cmd.args    = ['-d', -1];
			
		}
		else {
			switch (random.rand(0, 15)) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
					cmd.command = './run-rain';
					cmd.args    = ['-d', -1];
					break;
				case 5: 
					cmd.command = './run-perlin';
					cmd.args    = ['-d', -1, '-m', 2, '-x', 25];
					break;
				case 6: 
					cmd.command = './run-perlin';
					cmd.args    = ['-d', -1, '-m', 3, '-x', 40];
					break;
				case 7: 
				case 8: 
				case 9: 
				case 10: 
				case 11: 
					cmd.command = './run-gif';
					cmd.args    = ['-d', -1];
					break;
				case 12: 
					cmd.command = './run-clock';
					cmd.args    = ['-d', -1];
					break;
				case 13: 
					cmd.command = './run-circle';
					cmd.args    = ['-d', -1];
					break;
				case 14: 
					cmd.command = './run-twinkle';
					cmd.args    = ['-d', -1];
					break;
				case 15: 
					cmd.command = './run-hue-block';
					cmd.args    = ['-d', -1];
					break;
			}
			
		}
		
		startProcess(cmd.command, cmd.args, cmd.options);
		
		
	}
	
	_queue.on('idle', function() {

		console.log('Idle...');

		startBackgroundProcess();
	});
	
	_queue.on('process', function(item, callback) {
		startProcess(item.command, item.args, item.options, callback);
	});



	function stopProcess() {
		if (_process != null) {
			var process = _process;
			
			_process = null;

			process.kill('SIGINT');

		}
	}	

	function startProcess(command, args, options, callback) {

		try {
			stopProcess();
			
			if (callback == undefined) {
				callback = function() {
				};
			}

			function NO(error) {
				console.log("Failed to spawn...", error == undefined ? '' : error);
				callback();				
			}

			function YES() {
				callback();				
			}

			console.log('Spawning: %s', command, args, options);					

			var spawn = require('child_process').spawn;
			var process = spawn(command, args, options);

			process.stderr.on('data', function (data) {
				console.log('stderr: ' + data);
			});

			process.stdout.on('data', function (data) {
				console.log('stdout: ' + data);
			});
			
			if (process == null) {
				NO();
			}
			else {
				process.on('error', function() {
					NO();
				});
	
				process.on('close', function() {
					YES();
				});		
			}
			
			return _process = process;
		}
		catch (error) {
			NO(error);
		}
		
	}
	
	
	function spawn(commands) {
		console.log("Got 'spawn' command from Heroku...", commands);

		if (!util.isArray(commands))
			commands = [commands];
			
		var idle = _queue.empty();
		
		commands.forEach(function(cmd) {
			if (typeof cmd.priority == 'string' && cmd.priority == 'low') {
				if (idle)	
					_queue.push(cmd);
			}
			else 
				_queue.push(cmd);				
		});		
	}
	
	function message(messages) {

		if (!util.isArray(messages))
			messages = [messages];

		var commands = [];
		
		messages.forEach(function(msg) {

			if (msg.type == 'text') {
				var command = './run-text';
				var args    = [];
				var options = {cwd: 'matrix'};
		

				if (typeof msg.text == 'string') {
					args.push('-t');
					args.push(msg.text);
				}

				if (typeof msg.color == 'string') {

					if (msg.color == 'random') {
						msg.color = sprintf('hsl(%d,%d%%,%d%%)', random.rand(0, 360), 100, 50);
					}		

					args.push('-c');
					args.push(msg.color);			
				}

				if (typeof msg.font == 'string') {
					args.push('-f');
					args.push(msg.font);			
				}

				if (msg.size != undefined) {
					args.push('-s');
					args.push(msg.size);			
				}

				if (msg.delay != undefined) {
					args.push('-x');
					args.push(msg.delay);			
				}
				
				commands.push({command:command, args:args, options:options, priority:msg.priority});
								
			}

			if (msg.type == 'image') {
				var command = './run-image';
				var args    = [];
				var options = {cwd: 'matrix'};
		

				if (msg.image != undefined) {
					args.push('-f');
					args.push(msg.image);
				}
				
				if (msg.hold != undefined) {
					args.push('-h');
					args.push(msg.hold);
				}

				if (msg.delay != undefined) {
					args.push('-x');
					args.push(msg.delay);			
				}
				
				commands.push({command:command, args:args, options:options, priority:msg.priority});
								
			}

			if (msg.type == 'emoji') {
				var command = './run-image';
				var args    = [];
				var options = {cwd: 'matrix'};
		

				if (msg.id != undefined) {
					args.push('-f');
					args.push('images/emojis/' + parseInt(msg.id) + '.png');
				}
				
				if (msg.hold != undefined) {
					args.push('-h');
					args.push(msg.hold);
				}

				if (msg.delay != undefined) {
					args.push('-x');
					args.push(msg.delay);			
				}
				
				commands.push({command:command, args:args, options:options, priority:msg.priority});
								
			}

			/*
			if (msg.type == 'audio') {
				var command   = 'omxplayer';
				var args      = [];
				var options   = {cwd: 'python'};
		
				if (typeof msg.sound == 'string') {
					args.push('--no-keys');
					args.push('--no-osd');
					args.push('audio/' + msg.sound);
				}
				
				if (args.length > 0)
					commands.push({command:command, args:args, options:options, priority:msg.priority});
			}
			*/

			
		});
		
		if (commands.length > 0)
			spawn(commands);
	}
	
	function enableSocketIO() {
	
		var serverURL  = 'http://rpi-display.herokuapp.com';
		var serverName = 'Heroku';

		//serverURL  = 'http://192.1681.65';
		
		socket = require('socket.io-client')(serverURL);

		socket.on('connect', function() {
			console.log("SocketIO connected...");
		});

		socket.on('disconnect', function() {
			console.log("SocketIO disconnected...");
		});		


		socket.on('connect', function() {
			console.log("SocketIO connected...");
		});

		socket.on('disconnect', function() {
			console.log("SocketIO disconnected...");
		});		

		socket.on("spawn", function(commands) {
			spawn(commands);
		});

		socket.on("message", function(messages) {
			message(messages);
		});
		
	}
	
	 
	function sayHello() {
	
		function getIP(device) {
			var os = require('os');
			var ifaces = os.networkInterfaces();
		
			var iface = ifaces[device];
			
			console.log(ifaces);
			if (iface != undefined) {
			
				for (var i in iface) {
					var item = iface[i];
					console.log(item);
			
					if (item.family == 'IPv4')
						return item.address;
				}
			}
		
			return '';
		}
		
		var wlan0 = getIP('wlan0');
		var eth0 = getIP('eth0');
		
		var messages = [];
		
		if (wlan0 != '') {
			messages.push({
				type: 'image',
				image: 'images/wifi.png'
			});
			messages.push({
				type: 'text',
				text: wlan0,
				color: 'blue'
			});
		}
			
		if (eth0 != '') {
			messages.push({
				type: 'image',
				image: 'images/internet.png'
			});
			messages.push({
				type: 'text',
				text: eth0,
				color: 'blue'
			});
			
		}
		
		if (messages.length == 0) {
			messages.push({
				type: 'emoji',
				id: '733'
			});
		}

		message(messages);		
	}
	  

	enableSocketIO();
	sayHello();
	enableClock();
	
	 	
}

main();
