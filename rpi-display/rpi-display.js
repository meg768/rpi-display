var schedule = require('node-schedule');
var util     = require('util');
var sprintf  = require('./scripts/sprintf.js');
var random   = require('./scripts/random.js');
var matrix   = require('./scripts/matrix.js');



function main() {

	// Make sure we configure the size of the display 
	matrix.options.config = '96x96';
	matrix.options.paths.animations = sprintf('./animations/%s', matrix.options.config);
	matrix.options.paths.emojis = sprintf('./images/emojis/%s', matrix.options.config);
	
	// Set the time zone according to config settings
	process.env.TZ = 'Europe/Stockholm';
		
	function enableRates() {
	
		var config = {
			tickers: [
				{ id:'USDSEK', tags: {name: 'USD/SEK'} },
				{ id:'EURSEK', tags: {name: 'EUR/SEK'} },
				{ id:'EURUSD', tags: {name: 'UER/USD'} },
				
			],
			
			schedule: {
				hour:   new schedule.Range(7, 23),
				minute: new schedule.Range(8, 59, 20)
			}
			
		};
		var Rates = require('./scripts/xchange.js');
		var rates = new Rates(config);
	
		rates.on('xchange', function(xchange) {
			console.log(xchange);

			var display = new matrix.Display();
			var options = {};
			
			options.color = 'rgb(0,0,255)';
			options.size  = 24;
			
			xchange.forEach(function(rate) {
				display.text(sprintf('%s   %.2f', rate.name, rate.value));
			});

			display.send();
		});
	
	
	
	}	
	
	
	function enableRSS() {
	
		var config = {
			feeds: [
				{
					url: 'http://www.di.se/rss', 
					tags: { name: 'Di' },
					
					schedule: {
						hour:   new schedule.Range(7, 23),
						minute: new schedule.Range(3, 59, 20)
					}
				},
				{
					url: 'http://www.svd.se/?service=rss&type=senastenytt',
					tags: {name: 'SvD' },
	
					schedule: {
						hour:   new schedule.Range(7, 23),
						minute: new schedule.Range(6, 59, 20)
					}
				},
				{
					url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss',
					tags: {name: 'Google' },
	
					schedule: {
						hour:   new schedule.Range(7, 23),
						minute: new schedule.Range(9, 59, 20)
					}
				},
				{
					url: 'http://www.sydsvenskan.se/rss.xml',
					tags: {name: 'Sydsvenskan' },
	
					schedule: {
						minute: new schedule.Range(12, 59, 20)
					}
				}
			]
		};
		
		var RSS = require('./scripts/rss.js');
		var rss = new RSS(config);
	
		rss.on('rss', function(rss) {
			console.log('RSS:', rss);
			
			var display = new matrix.Display();
			var options = {};
			
			options.color = 'rgb(0,0,255)';
			options.size  = 24;
			
			display.text(sprintf('Nyheter från %s', rss.name));
			
			rss.messages.forEach(function(message) {
				var text = '';
				
				if (message.category != undefined)
					text += message.category;
					
				if (text != '')
					text += ' - ';
					
				if (message.title != undefined)
					text += message.title; 
					
				display.text(text, options);
						
			});
			
			display.send();


		});
	
	
	}		


	
	function enableQuotes() {
		var numeral = require('numeral');

		var config = {
			schedule: {
				hour   : new schedule.Range(7, 23),
				minute : new schedule.Range(13, 59, 13)
			},
			
			tickers : [
				
				{ id: '^OMX',    tags: {name: 'OMX'}},
				{ id: '^GSPC',   tags: {name: 'S&P 500'}},
				{ id: '^IXIC',   tags: {name: 'NASDAQ'}},
				{ id: 'PHI.ST',  tags: {name: 'PHI', currency: 'SEK'}},
				{ id: 'HM-B.ST', tags: {name: 'H&M', currency: 'SEK'}}
				
			]
		};
		
		var Quotes = require('./scripts/quotes.js');
		var quotes = new Quotes(config);
	
		quotes.on('quotes', function(data) {
			var display = new matrix.Display();
			var now = new Date();
			var space = '   ';
			
			var options = {};
			options.size = 26;
			
			data.forEach(function(quote) {


				if (quote.change == 0)
					options.color = 'rgb(0,0,255)';
				if (quote.change < 0)
					options.color = 'rgb(255,0,0)';
				if (quote.change > 0)
					options.color = 'rgb(0,255,0)';
				

				var text = '';

				text += quote.name + space;
				text += numeral(quote.change).format('+0.0') + '%' + space;

				if (quote.currency != undefined) {
					text += numeral(quote.price).format('0,000.00') + space;
				}

	
				display.text(text, options);
	
			});
				
			display.send();
			
			
		});
		
	}
	
	function enableWeather() {
	
	
		var config = {
			woeid: '12883682',
			
			schedule: {
				hour   : new schedule.Range(7, 23),
				minute : [10, 40]
			}
		};	
	
		var Weather = require('./scripts/weather.js');
		var weather = new Weather(config);

		weather.on('forecast', function(forecast) {
			console.log(forecast);
			
			var display = new matrix.Display();
			
			forecast.forEach(function(day) {

				display.text(sprintf('%s - %s, %d°', day.day, day.condition.toLowerCase(), Math.round(day.high)), {delay:15});
				display.image(sprintf('./images/weather/%s/%s.png', matrix.options.config, day.image), {delay:15, scroll:'horizontal'});

			});
			
			display.send();
			
		});
	
	
	
	}	
	
		
	function enableClock() {
		var colors = require('./scripts/colors.js');
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
	enableRates();
	enableClock();
	enableQuotes();
	enableRSS();
	enableWeather();

}

main();
