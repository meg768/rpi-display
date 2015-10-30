var schedule = require('node-schedule');
var util     = require('util');
var sprintf  = require('./sprintf.js');
var random   = require('./random.js');
var Matrix   = require('./matrix.js');

var matrix = new Matrix();

// { "command": "python", "options": {"cwd":"python"}, "args": ["run-text.py", "-t", "HEJ", "-c", "blue"]}

function main() {

	// Set the time zone according to config settings
	process.env.TZ = 'Europe/Stockholm';
	

	matrix.on('idle', function() {
		console.log('YEEEEEEEEEES IDLE');
		startBackgroundProcess()
	});
		
	function enableClock() {
		var rule = new schedule.RecurrenceRule();
	
		rule.hour   = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
		rule.minute = new schedule.Range(0, 59, 1);
		rule.second = [0, 20, 40];
			
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
			msg.priority = 'high';
			msg.delay    = 30;
			msg.color    = sprintf('rgb(%d,%d,%d)', color.red, color.green, color.blue);
			msg.text     = sprintf('%02d:%02d', now.getHours(), now.getMinutes());
			console.log(msg);

			matrix.send(msg);	
		});
	}
	
	function startBackgroundProcess() {

		var now = new Date();
		
		var cmd = {};
		cmd.options = {cwd: 'matrix'}
		cmd.priority = 'low';
		
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
		
		matrix.sendRaw(cmd);
		
		
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

		matrix.send(messages);		
	}
	  

	sayHello();
	enableClock();
	
	 	
}

main();
