var schedule = require('node-schedule');
var util     = require('util');
var minimist = require('minimist');
var numeral  = require('numeral');
var moment   = require('moment');

var config   = require('./scripts/config.js');
var sprintf  = require('./scripts/sprintf.js');
var random   = require('./scripts/random.js');
var matrix   = require('./scripts/matrix.js');

var args     = minimist(process.argv.slice(2));


function App() {

	var _this = this;
	var _counter = 0;
	

	function fetchRates(tickers, callback) {

		var Rates = require('./scripts/xchange.js');
		var rates = new Rates(tickers);
	
		rates.fetch(function(rates) {
			console.log('XCHANGE', rates);
			callback(rates);
		});
	}	

	function displayWeather(forecast) {

		var display = new matrix.Display();

		var color = 'rgb(0,0,255)';

		display.text('Väder', {color:color});
		
		forecast.forEach(function(day) {
			display.text(sprintf('%s', day.day), {color:color});
			display.image(sprintf('./images/weather/96x96/%s.png', day.image), {scroll:'horizontal'});
			
		});

		display.send();
		
	}

	function fetchWeather(woeid, callback) {
		
		var Weather = require('./scripts/weather.js');
		var weather = new Weather(woeid);
		
		weather.fetch(function(forecast) {
			console.log('Weather:', forecast);
			callback([forecast[1], forecast[2], forecast[3]]);
		});

	}
	
	
	function displayRates(rates) {

		var display = new matrix.Display();

		var color = 'rgb(0,0,255)';
		
		display.text('Valutor', {color:color});

		rates.forEach(function(rate) {
				
			console.log(rate);
			display.text(sprintf('%s  %.2f', rate.name, rate.value), {color:color});
		});

		display.send();
		
	}


	function fetchRSS(feeds, callback) {
		
		var RSS = require('./scripts/rss.js');
		var rss = new RSS(feeds);
	
		rss.fetch(function(messages) {
			console.log('RSS:', messages);
			callback(messages);
		});

	}
	
	
	function displayRSS(messages) {

		var display = new matrix.Display();
		
		var color = 'rgb(0,0,255)';
		
		display.text(sprintf('Nyheter från %s', messages[0].name), {color:color});
		
		messages.forEach(function(message) {
			var text = '';
			
			if (message.category != undefined)
				text += message.category;
				
			if (text != '')
				text += ' - ';
				
			if (message.title != undefined)
				text += message.title; 
				
			display.text(text, {color:color});
					
		});
		
		display.send();
		
	}
		
		
	function fetchQuotes(tickers, callback) {
	
		var Quotes = require('./scripts/quotes.js');
		var quotes = new Quotes(tickers);

		quotes.fetch(function(quotes) {
			console.log('QUOTES:', quotes);
			callback(quotes);
		});
	}
	
	function displayQuotes(quotes) {
		
		if (quotes.length > 0) {
			var display = new matrix.Display();
			
			quotes.forEach(function(quote) { 

				var color = 'rgb(0,0,255)';
				
				if (quote.logo)
					display.image(quote.logo, {scroll:'horizontal'});
				else
					display.text(quote.name, {color:color});
				
				display.text(sprintf('%s%s', numeral(quote.price).format('0,000.00'), quote.currency ? ' ' + quote.currency : '', {color:color}));
				
				if (quote.change == 0)
					color = 'rgb(0,0,255)';
				if (quote.change < 0)
					color = 'rgb(255,0,0)';
				if (quote.change > 0)
					color = 'rgb(0,255,0)';
		
				display.text(numeral(quote.change).format('+0.0') + '%%', {color:color});

				if (quote.volume > 0) {
					color = 'rgb(0,0,255)';
					display.text(sprintf('%d', Math.round(quote.volume / 100) * 100), {color:color});
					
				}
				
			});

			display.send();
			
		}
		
	}
	
	
	function displayClock() {
			
		var display = new matrix.Display();
		var now = new Date();

		var options = {};
		options.color = 'rgb(255, 0, 0)';
		options.delay = config.matrix.defaults.text.delay * 2.0;

		if (args.config == '96x96') {
			options.font  = 'Digital';
			options.size  = 50;
		}

		display.text(sprintf('%02d:%02d', now.getHours(), now.getMinutes()), options);	
		display.send();	
		
	}


	function scheduleClock(callback) {
		var rule = new schedule.RecurrenceRule();	
		rule.minute = new schedule.Range(0, 59, 5);
		
		if (callback == undefined)
			callback = displayClock;

		schedule.scheduleJob(rule, function() {
			callback();
		});
	}
	
	
	function displayIdle() {
		var now = new Date();

		var options = {};
		options.file = sprintf('./animations/%s', args.config);
		options.duration = -1;
		options.iterations = 10000;

		matrix.start(matrix.animation(options));
	}
	
	
	function scheduleRecurrences() {
		var rule = new schedule.RecurrenceRule();
		var index = 0;
		
		//rule.hour = new schedule.Range(7, 23, 1);
		rule.minute = new schedule.Range(3, 59, 5);
		
		schedule.scheduleJob(rule, function() {

			switch(index % 4) {
				case 0: {
					fetchRSS(config.rss.feeds[0], displayRSS);
					config.rss.feeds.push(config.rss.feeds.shift());
					break;
				}
				case 1: {
					fetchRates(config.xchange.tickers, displayRates);
					break;
				}
				case 2: {
					fetchWeather('12883682', displayWeather);
					break;
				}
				case 3: {
					fetchQuotes(config.quotes.tickers, displayQuotes);
					break;
				}
			}
			
			index = (index + 1) % 10000;
		});
	}

		
	
	_this.run = function() {

		// config.matrix.defaults.text.font = 'Century-Gothic-Bold';

		config.quotes   = config.quotes  || {};
		config.xchange  = config.xchange || {};
		config.rss      = config.rss     || {};
		
		
		config.quotes.tickers = [
			{ id: '^OMX',   name: 'OMX Index'},
			{ id: 'PHI.ST', name: 'Phase', currency: 'SEK'}
		];


		config.xchange.tickers = [
			{id: 'USDSEK', name: 'USD/SEK'},
			{id: 'EURSEK', name: 'EUR/SEK'},
			{id: 'EURUSD', name: 'EUR/USD'}
		];
		

		config.rss.feeds = [
			{url: 'http://www.di.se/rss', name: 'Dagens Industri'},
			{url: 'http://www.sydsvenskan.se/rss.xml', name: 'Sydsvenskan'},
			{url: 'http://www.svd.se/?service=rss&type=senastenytt', name: 'SvD'},
			{url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss', name: 'Google'}
		];
		
		
		if (args.config == '32x32') {
			config.matrix.width = 32;
			config.matrix.height = 32;
			config.matrix.paths.animations = './animations/32x32';
			config.matrix.paths.emojis = './images/emojis/32x32';

			config.matrix.defaults.text.delay = 20;
			config.matrix.defaults.text.size = 20;
			config.matrix.defaults.image.delay = 20;
			
		}	

		else if (args.config == '96x96') {
			config.matrix.width = 96;
			config.matrix.height = 96;
			
			config.matrix.defaults.text.delay = 10;
			config.matrix.defaults.text.size = 32;
			
			config.matrix.defaults.image.delay = 10;
	
			config.matrix.paths.animations = './animations/96x96';
			config.matrix.paths.emojis = './images/emojis/96x96';
			
		}	
		else {
			console.log('No configuration specified. Use the --config option.');
			process.exit(-1);
		}
		
		// Set the time zone according to config settings
		process.env.TZ = config.timezone;
	
		// Use swedish settings
		moment.locale(config.locale);


		matrix.init();

		matrix.idle(function() {
			displayIdle();
		});
		
		scheduleRecurrences();
		scheduleClock();

	}
	
}


var app = new App();
app.run();


