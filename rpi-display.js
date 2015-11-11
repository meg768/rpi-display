var schedule = require('node-schedule');
var util     = require('util');
var minimist = require('minimist');
var numeral  = require('numeral');
var moment   = require('moment');

var config   = require('./scripts/config.js');
var sprintf  = require('./scripts/sprintf.js');
var random   = require('./scripts/random.js');
var matrix   = require('./scripts/matrix.js');


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

	
	function displayRates(rates) {

		var display = new matrix.Display();
		var options = {};
		
		options.color = 'rgb(0,0,255)';
		
		rates.forEach(function(rate) {
				
			console.log(rate);
			display.text(sprintf('%s   %.2f', rate.name, rate.value));
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
				var options = {};
				options.color = 'rgb(255, 255, 255';

				display.image(quote.logo, {scroll:'horizontal'});
				display.text(numeral(quote.price).format('0,000.00') + ' SEK', options);
				
				if (quote.change == 0)
					options.color = 'rgb(0,0,255)';
				if (quote.change < 0)
					options.color = 'rgb(255,0,0)';
				if (quote.change > 0)
					options.color = 'rgb(0,255,0)';
		
				display.text(numeral(quote.change).format('+0.0') + '%%', options);

				options.color = 'rgb(0,0,255)';
				display.text(sprintf('%d', Math.round(quote.volume / 100) * 100), options);
				
			});

			display.send();
			
		}
		
	}
	
	
	function displayClock() {
			
		var display = new matrix.Display();
		var now = new Date();

		var options = {};
		options.color = 'rgb(255, 0, 0)';
		options.font  = 'Digital';
		options.size  = 50;
		display.text(sprintf('%02d:%02d', now.getHours(), now.getMinutes()), options);	
		display.send();	
		
	}


	function scheduleClock(callback) {
		var rule = new schedule.RecurrenceRule();	
		rule.minute = new schedule.Range(0, 59, 1);
		
		if (callback == undefined)
			callback = displayClock;

		schedule.scheduleJob(rule, function() {
			callback();
		});
	}
	
	
	function displayIdle() {
		var now = new Date();
		var display = new matrix.Display();

		var options = {};
		options.file = sprintf('./animations/96x96');
		options.duration = -1;

		matrix.start(matrix.animation(options));
	}
	
	
	function scheduleRecurrences() {
		var rule = new schedule.RecurrenceRule();
		var index = 0;
		
		rule.hour = new schedule.Range(7, 21, 1);
		rule.minute = new schedule.Range(0, 59, 1);
		
		schedule.scheduleJob(rule, function() {

			switch(index % 6) {
				case 0: {
					fetchRSS({url: 'http://www.di.se/rss', name:'Dagens Industri'}, displayRSS);
					break;
				}
				case 1: {
					fetchRSS({url: 'http://www.sydsvenskan.se/rss.xml', name:'Sydsvenskan'}, displayRSS);
					break;
				}
				case 2: {
					fetchRSS({url: 'http://www.svd.se/?service=rss&type=senastenytt', name:'SvD'}, displayRSS);
					break;
				}
				case 3: {
					fetchRSS({url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss', name:'Google'}, displayRSS);
					break;
				}
				case 4: {
					fetchRSS({url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss', name:'Google'}, displayRSS);
					break;
				}
				case 5: {
					var tickers = [
						{id: 'USDSEK', name: 'USD/SEK'},
						{id: 'EURSEK', name: 'EUR/SEK'},
						{id: 'EURUSD', name: 'EUR/USD'}
					];
					
					fetchRates(tickers, displayRates);
					break;
				}
			}
			
			index = (index + 1) % 1000;
		});
	}

		
	
	_this.run = function() {
		// Set the time zone according to config settings
		process.env.TZ = config.timezone;
	
		// Use swedish settings
		moment.locale(config.locale);

		config.matrix.width = 96;
		config.matrix.height = 96;
		
		config.matrix.defaults.text.font = 'Century-Gothic-Bold';
		config.matrix.defaults.text.delay = 20;
		config.matrix.defaults.text.size = 32;
		config.matrix.defaults.image.delay = 20;

		config.matrix.paths.animations = './animations/96x96';
		config.matrix.paths.emojis = './emojis/96x96';


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


