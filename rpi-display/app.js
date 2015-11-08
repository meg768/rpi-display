var schedule = require('node-schedule');
var util     = require('util');
var minimist = require('minimist');

var sprintf  = require('./scripts/sprintf.js');
var random   = require('./scripts/random.js');
var matrix   = require('./scripts/matrix.js');


function loop() {
	var rule = new schedule.RecurrenceRule();

	var activities = [];
	var index = 0;
	
	if (true) {
		var config = {
			tickers: [
				{ id:'USDSEK', tags: {name: 'USD/SEK'} },
				{ id:'EURSEK', tags: {name: 'EUR/SEK'} },
				{ id:'EURUSD', tags: {name: 'EUR/USD'} },
				
			]
		};

		var Rates = require('./scripts/xchange.js');
		var rates = new Rates(config);
	
		rates.on('xchange', function(xchange) {
			console.log('XCHANGE', xchange);

			var display = new matrix.Display();
			var options = {};
			
			options.color = 'rgb(0,0,255)';
			
			xchange.forEach(function(rate) {
				display.text(sprintf('%s   %.2f', rate.name, rate.value));
			});

			display.send();
		});

		activities.push(rates);				
	}
	
	
	if (true) {
		var numeral = require('numeral');

		var config = {
			tickers : [
				
				{ id: '^OMX',    name: 'OMX'},
				{ id: '^GSPC',   name: 'S&P 500'},
				{ id: '^IXIC',   name: 'NASDAQ'},
				{ id: 'PHI.ST',  name: 'PHI', currency: 'SEK'},
				{ id: 'HM-B.ST', name: 'H&M', currency: 'SEK'}
				
			]
		};
		
		var Quotes = require('./scripts/quotes.js');
		var quotes = new Quotes(config);
	
		quotes.on('quotes', function(quotes) {
			
			console.log('QUOTES', quotes);


			var display = new matrix.Display();
			var now = new Date();
			var space = '   ';
			
			var options = {};
			
			quotes.forEach(function(quote) {


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
		
		activities.push(quotes);				

	}
	
	
	if (true) {
		var RSS = require('./scripts/rss.js');

		function display(messages) {
			console.log('RSS:', messages);

			var display = new matrix.Display();
			var options = {};
			
			options.color = 'rgb(0,0,255)';
			
			display.text(sprintf('Nyheter från %s', messages[0].name));
			
			messages.forEach(function(message) {
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
			
		}

		if (true) {
			var config = {
				feeds: [
					{url: 'http://www.di.se/rss', name:'Di'}, 
				]
			};
			
			var rss = new RSS(config);
		
			rss.on('rss', function(rss) {
				display(rss);
			});
	
			activities.push(rss);				
		}

		if (true) {
			var config = {
				feeds: [
					{url: 'http://www.sydsvenskan.se/rss.xml', name:'Sydsvenskan'}, 
				]
			};
			
			var RSS = require('./scripts/rss.js');
			var rss = new RSS(config);
		
			rss.on('rss', function(rss) {
				display(rss);
			});
	
			activities.push(rss);				
		}
	
		
	}

	if (true) {

		var config = {
			woeid: '12883682'
		};	
	
		var Weather = require('./scripts/weather.js');
		var weather = new Weather(config);

		weather.on('forecast', function(forecast) {
			console.log('WEATHER', forecast);

			var display = new matrix.Display();
			
			forecast.forEach(function(day) {

				display.text(sprintf('%s - %s, %d°', day.day, day.condition.toLowerCase(), Math.round(day.high)), {delay:15});
				display.image(sprintf('./images/weather/%s/%s.png', args.config, day.image), {delay:15, scroll:'horizontal'});

			});
			
			display.send();
		});
	
	
	}
	
	rule.hour   = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
	rule.minute = new schedule.Range(0, 59, 7);
	//rule.second = new schedule.Range(0, 59, 3);
		

	
	schedule.scheduleJob(rule, function() {
		
		
		var activity = activities[index]; //random.choose(activities);
		
		activity.fetch();
		
		index = (index + 1) % activities.length;
	});
	
	
}



function main() {

	var args = minimist(process.argv.slice(2));

	// Set the time zone according to config settings
	process.env.TZ = 'Europe/Stockholm';

	if (args.config == undefined) {
		console.log('No configuration speciefied. Use the --config option.');
		process.exit(-1);
	}

	// Make sure we configure the size of the display 
	matrix.options.paths.animations = sprintf('./animations/%s', args.config);
	matrix.options.paths.emojis = sprintf('./images/emojis/%s', args.config);

	if (args.config == '32x32') {
		matrix.options.config = '32x32';
		matrix.options.defaults.image.delay = 30;
		matrix.options.defaults.text.delay = 30;
		matrix.options.defaults.text.size = 20;
	}

	if (args.config == '96x96') {
		matrix.options.config = '96x96';
		matrix.options.defaults.image.delay = 20;
		matrix.options.defaults.text.delay = 20;
		matrix.options.defaults.text.size = 24;
	}

	if (args.config == 'phi') {
		matrix.options.config = '32x32';
		matrix.options.defaults.image.delay = 30;
		matrix.options.defaults.text.delay = 30;
		matrix.options.defaults.text.size = 20;
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
	loop();
}

main();
