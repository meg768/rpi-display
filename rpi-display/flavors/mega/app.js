var schedule = require('node-schedule');
var util     = require('util');
var sprintf  = require('./../../scripts/sprintf.js');
var random   = require('./../../scripts/random.js');
var matrix   = require('./../../scripts/matrix.js');



function main() {

	// Make sure we configure the size of the display 
	matrix.options.config = '96x96';
	matrix.options.paths.animations = './flavors/mega/animations';
	matrix.options.paths.emojis = './emojis/96x96';
	
	// Set the time zone according to config settings
	process.env.TZ = 'Europe/Stockholm';
	
	
	function enableRSS() {
	
		var config = {
			feeds: [
				{name: 'SvD',    url: 'http://www.svd.se/?service=rss&type=senastenytt'}, 
				{name: 'SDS',    url: 'http://www.sydsvenskan.se/rss.xml'}, 
				{name: 'Di',     url: 'http://www.di.se/rss'}, 
				{name: 'Google', url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss'}
			],
			
			schedule: {
				hour   : new schedule.Range(7, 23),

				// Display RSS news every 20 minutes
				minute : new schedule.Range(7, 59, 20)
			}
			
		}	

		var RSS = require('../../scripts/rss.js');
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
		var numeral = require('numeral');

		var config = {
			schedule: {
				hour   : new schedule.Range(7, 23),
				minute : new schedule.Range(2, 59, 1)
			},
			
			quotes : [
				
				{ name:'OMX Index', symbol:'^OMX'},
				{ name:'PHI',     symbol:'PHI.ST'},
				{ name:'H&M',       symbol:'HM-B.ST'}
			]
		};
		
		var Quotes = require('../../scripts/quotes.js');
		var quotes = new Quotes(config);
	
		quotes.on('quotes', function(data) {
			var display = new matrix.Display();
			var now = new Date();
			
			var options = {};
			options.size = 30;
			
			data.forEach(function(quote) {
				var price  = quote.price;
				var change = quote.change;
				var volume = quote.volume;
				
				// Remove some precision
				price   = parseFloat(price.toPrecision(4));
				change  = parseFloat(change.toPrecision(3));
				volume  = parseFloat(volume.toPrecision(4));

				// Format
				price   = numeral(price).format('0,000.[00]')
				change  = numeral(change).format('+0,000.0[0]');
				volume  = numeral(volume).format('0,000');

				if (quote.change == 0)
					options.color = 'rgb(0,0,255)';
				if (quote.change < 0)
					options.color = 'rgb(255,0,0)';
				if (quote.change > 0)
					options.color = 'rgb(0,255,0)';

				display.text(sprintf('%s %s %s%% (%s)', quote.name, price, change, volume), options);
	
			});
				
			display.send();
			
			
		});
		
	}
		
	function enableClock() {
		var colors = require('../../scripts/colors.js');
		var rule = new schedule.RecurrenceRule();
	
		//rule.hour   = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
		rule.minute = new schedule.Range(0, 59, 5);
			
		
		schedule.scheduleJob(rule, function() {
			var display = new matrix.Display();
			var now = new Date();
			var hue = ((now.getHours() % 12) * 60 + now.getMinutes()) / 2;			
			var color = colors.hslToRgb(hue / 360, 1, 0.5);
			
			var options = {};
			options.size     = 30;
			options.delay    = 25;
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

		if (wlan0 != '') {
			display.text(wlan0, {color:'blue'});
		}
			
		if (eth0 != '') {
			display.text(eth0, {color:'blue'});
		}
		
		if (wlan0 != '' || eth0 != '')
			display.emoji(435, {scroll:'horizontal'});

		display.send();		
	}
	  

	sayHello();
	enableClock();
	enableQuotes();
	enableRSS();
	 	
}

main();
