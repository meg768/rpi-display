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


	_queue.on('idle', function() {

		console.log('Idle...');

		var command = './run-text';
		var args    = [];
		var options = {cwd: 'matrix'};

		startProcess(command, args, options);
		


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
			
			_process = process;
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
					args.push('emojis/' + parseInt(msg.id) + '.png');
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
	
	 	
}

main();
