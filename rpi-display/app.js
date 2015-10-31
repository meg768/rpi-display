var schedule = require('node-schedule');
var util     = require('util');
var sprintf  = require('./sprintf.js');
var random   = require('./random.js');
var matrix   = require('./matrix.js');

// { "command": "python", "options": {"cwd":"python"}, "args": ["run-text.py", "-t", "HEJ", "-c", "blue"]}

function main() {

	// Set the time zone according to config settings
	process.env.TZ = 'Europe/Stockholm';
	
	
	// Function to generate an array of integers between a range...	
	function range(start, stop, step) {
		
		var values = [];
		
		if (step == undefined)
			step = 1;
			
		for (var i = start; i <= stop; i += step)
			values.push(i);
			
		return values;
		
	}
	
	
	
	function enableRSS() {
	
		var config = {
			feeds: [
				{name: 'SvD',    url: 'http://www.svd.se/?service=rss&type=senastenytt'}, 
				{name: 'SDS',    url: 'http://www.sydsvenskan.se/rss.xml'}, 
				{name: 'Di',     url: 'http://www.di.se/rss'}, 
				{name: 'Google', url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss'}
			],
			
			schedule: {
				// Display from 8-21
				hour : range(8, 21),
	
				// Display RSS news every 20 minutes
				minute : range(0, 59, 20)
			}
			
		}	

		var RSS = require('./rss.js');
		var rss = new RSS(config);
	
		rss.on('feed', function(rss) {
			var display = new matrix.Display();
			var options = {};
			
			options.color = 'rgb(0,0,255)';
			options.size  = 24;
			
			display.text(sprintf('%s - %s - %s', rss.name, rss.category, rss.text), options);
			display.send();

		});

	
	}
	
	function enableQuotes() {


		var config = {
			schedule: {
				minute : range(0, 59),
				second : [0, 30]
			},
			
			quotes : [
				
				{ name:'OMXS30', symbol:'^OMX'},
				{ name:'PHI', symbol:'PHI.ST'},
				{ name:'H&M', symbol:'HM-B.ST'}
			]
		};
		
		var Quotes = require('./quotes.js');
		var quotes = new Quotes(config);
	
		quotes.on('quotes', function(data) {
			var display = new matrix.Display();
			var now = new Date();
			
			var options = {};
			options.size = 24;
			
			data.forEach(function(quote) {
				if (quote.change == 0)
					options.color = 'rgb(0,0,255');
				if (quote.change < 0)
					options.color = 'rgb(255,0,0');
				if (quote.change > 0)
					options.color = 'rgb(0,255,0');

				display.text(sprintf('%s - %.2f %s%.1f%% ', quote.name, quote.price, quote.change >= 0 ? '+' : '', quote.change), options);
	
			});
				
			display.send();
			
			
		});
		
	}
		
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
			var display = new matrix.Display();
			var now = new Date();
			var hue = ((now.getHours() % 12) * 60 + now.getMinutes()) / 2;			
			var color = hslToRgb(hue / 360, 1, 0.5);
			
			var options = {};
			options.type     = 'text';
			//options.priority = 'low';
			options.size     = 30;
			options.delay    = 30;
			options.color    = sprintf('rgb(%d,%d,%d)', color.red, color.green, color.blue);

			display.text(sprintf('%02d:%02d', now.getHours(), now.getMinutes()), options);	
			display.send();	
		});
	}
	

	

	
	 
	function sayHello() {
	
		var display = new matrix.Display();
		
		function getIP(device) {
			var os = require('os');
			var ifaces = os.networkInterfaces();
		
			var iface = ifaces[device];
			
			if (iface != undefined) {
			
				for (var i in iface) {
					var item = iface[i];
			
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
			display.image('./images/wifi.png');
			display.text(wlan0, {color:'blue'});
		}
			
		if (eth0 != '') {
			display.image('./images/internet.png');
			display.text(eth0, {color:'blue'});
		}
		
		if (wlan0 != '' || eth0 != '') {
			display.emoji(733);
		}

		display.send();		
	}
	  

	sayHello();
	enableClock();
	enableQuotes();
	enableRSS();
	
	 	
}

main();
