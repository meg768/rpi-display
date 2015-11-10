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
	var _quotes = [];	


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
			
			_quotes.forEach(function(quote) { 
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
	
	
	function displayAnimation() {
		var display = new matrix.Display();

		var pong = {};
		pong.file = sprintf('./animations/32x32/pong.gif');
		pong.duration = 60;
		pong.iterations = 1000; // Bug! Had to set this, fix it...

		var pacman = {};
		pacman.file = sprintf('./animations/32x32/pacman.gif');
		pacman.duration = 60;
		pacman.iterations = 1000;

		display.animation(random.choose([pong, pacman]));
		display.send();
	}
	

	function displayClock() {
		var display = new matrix.Display();
		var now = new Date();

		var options = {};
		options.color = 'rgb(255, 0, 0)';

		display.text(sprintf('%02d:%02d', now.getHours(), now.getMinutes()), options);	
		display.send();	
		
	}
	

	function displayFika() {
		
		var display = new matrix.Display();

		display.emoji(48, {scroll:'horizontal', delay:30});
		display.emoji(268, {scroll:'horizontal', delay:30});
			
		display.send();
		
	}
	
	function displayIdle() {
		var now = new Date();

		var hours   = now.getHours();
		var minutes = now.getMinutes();
		
		if (hours == 15 && minutes >= 0 && minutes < 30)
			displayFika();
		else
			displayQuotes(_quotes)
	}
	
	
	function scheduleGuestStars() {
		var rule = new schedule.RecurrenceRule();
		var index = 0;
		
		rule.minute = new schedule.Range(3, 59, 20);
		
		schedule.scheduleJob(rule, function() {
			switch(index % 4) {
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
				case 5: {
					var rates = [
						{ id:'USDSEK', tags: {name: 'USD/SEK'} },
						{ id:'EURSEK', tags: {name: 'EUR/SEK'} },
						{ id:'EURUSD', tags: {name: 'UER/USD'} }												
					];
					
					fetchRates(rates, displayRates);
				}
			}
			
			index = (index + 1) % 1000;
		});
	}

		
	function scheduleClock() {
		var rule = new schedule.RecurrenceRule();	
		rule.minute = new schedule.Range(0, 59, 5);
		
		schedule.scheduleJob(rule, function() {
			displayClock();
		});
	}
	
	
	function scheduleQuotes() {
	
		function fetchMyQuotes() {
		
			var tickers = [{ id: 'PHI.ST',  name: 'PHI', currency: 'SEK', logo:'./images/phi/logo.png'}];
		
			fetchQuotes(tickers, function(quotes) {
				_quotes = quotes;
			});
			
		}
	
		var rule = new schedule.RecurrenceRule();
		rule.hour = new schedule.Range(8, 18, 1);
		rule.minute = new schedule.Range(0, 59, 1);
			
		schedule.scheduleJob(rule, function() {
			fetchMyQuotes();
		});
		
		// Get quote now
		fetchMyQuotes();
		
	}

	_this.run = function() {
		// Set the time zone according to config settings
		process.env.TZ = config.timezone;
	
		// Use swedish settings
		moment.locale(config.locale);

		config.matrix.width = 64;
		config.matrix.height = 32;
		config.matrix.defaults.text.font = 'Century-Gothic-Bold-Italic';
		config.matrix.defaults.text.delay = 25;
		config.matrix.defaults.text.size = 24;
		config.matrix.defaults.image.delay = 25;

		matrix.init();

		matrix.idle(function() {
			displayAnimation();
		});
		
		scheduleQuotes();
		scheduleClock();
		scheduleGuestStars();
		
	}
	
}


var app = new App();
app.run();


