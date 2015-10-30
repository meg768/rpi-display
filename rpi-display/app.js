var schedule = require('node-schedule');
var util     = require('util');
var sprintf  = require('./sprintf.js');
var random   = require('./random.js');
var matrix   = require('./matrix.js');


// { "command": "python", "options": {"cwd":"python"}, "args": ["run-text.py", "-t", "HEJ", "-c", "blue"]}

function main() {

	var Queue = require('./runqueue.js');

	// Set the time zone according to config settings
	process.env.TZ = 'Europe/Stockholm';
	
	var _process = null;
	var _queue = new Queue();


	matrix.on('idle', function(){
		console.log('YEEEEEEEEEES IDLE');
	});
		
	function enableClock() {
		var rule = new schedule.RecurrenceRule();
	
		rule.hour   = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
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
			msg.text     = sprintf('%02d:%02d', now.getHours(), now.getMinutes());
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
					cmd.command = './run-rain';
					cmd.args    = ['-d', -1];
					break;
				case 2: 
					cmd.command = './run-perlin';
					cmd.args    = ['-d', -1, '-m', 3, '-x', 40];
					break;
				default: 	
					cmd.command = './run-gif';
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

		matrix.send(messages);
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
				image: './images/wifi.png'
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
				image: './images/internet.png'
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
	  

	sayHello();
	enableClock();
	
	 	
}

main();
