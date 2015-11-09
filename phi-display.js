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
	
	function displayRSS(feed) {
		
		var RSS = require('./scripts/rss.js');
		var rss = new RSS([feed]);
	
		rss.fetch(function(messages) {
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
		});

	}
	
	function displayFika() {
		
		var display = new matrix.Display();

		display.text('Fika', {color:'white', delay:30});
		display.emoji(48, {scroll:'horizontal', delay:30});
		display.emoji(268, {scroll:'horizontal', delay:30});
		display.emoji(262, {scroll:'horizontal', delay:30});
			
		display.send();
		
	}
	
	function displayQuotes(quotes) {
		
		if (quotes.length > 0) {
			var display = new matrix.Display();
			
			_quotes.forEach(function(quote) { 
				var options = {};
				options.color = 'rgb(255, 255, 255';
				options.delay = 18;
				options.size  = 24;

				display.image(quote.logo, {scroll:'horizontal', delay:18});
				display.text(numeral(quote.price).format('0,000.00') + ' SEK', options);
				
				if (quote.change == 0)
					options.color = 'rgb(0,0,255)';
				if (quote.change < 0)
					options.color = 'rgb(255,0,0)';
				if (quote.change > 0)
					options.color = 'rgb(0,255,0)';
		
				display.text(numeral(quote.change).format('+0.0') + '%%', options);

				options.color = 'rgb(0,0,255)';
				display.text(sprintf('%d', quote.volume), options);
				
			});

			display.send();
			
		}
		
	}
	
	function displayClock() {
		var display = new matrix.Display();
		var now = new Date();

		var options = {};
		options.color = 'rgb(255, 0, 0)';
		options.size = 24; 

		display.text(sprintf('%02d:%02d', now.getHours(), now.getMinutes()), options);	
		display.send();	
		
	}

	function scheduleInterrupts() {
		var rule = new schedule.RecurrenceRule();
		var index = 0;
		
		rule.minute = new schedule.Range(3, 59, 15);
		
		schedule.scheduleJob(rule, function() {
			switch(index % 5) {
				case 0: {
					displayRSS({url: 'http://www.di.se/rss', name:'Dagens Industri'});
					break;
				}
				case 1: {
					displayRSS({url: 'http://www.sydsvenskan.se/rss.xml', name:'Sydsvenskan'});
					break;
				}
				case 2: {
					displayRSS({url: 'http://www.svd.se/?service=rss&type=senastenytt', name:'SvD'});
					break;
				}
				case 3: {
					displayRSS({url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss', name:'Google'});
					break;
				}
				case 4: {
					displayAnimation();
					break;
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
	
	
		function fetchQuotes() {
		
			var Quotes = require('./scripts/quotes.js');
			var quotes = new Quotes([{ id: 'PHI.ST',  name: 'PHI', currency: 'SEK', logo:'./images/phi/logo.png'}]);

			quotes.fetch(function(quotes) {
				console.log(quotes);
				_quotes = quotes;
			});
			
		}
	
		var rule = new schedule.RecurrenceRule();
		rule.hour = new schedule.Range(8, 18, 1);
		rule.minute = new schedule.Range(0, 59, 1);
			
		schedule.scheduleJob(rule, function() {
			fetchQuotes();
		});
		
		// Get quote now
		fetchQuotes();
		
	}

	_this.run = function() {
		// Set the time zone according to config settings
		process.env.TZ = config.timezone;
	
		// Use swedish settings
		moment.locale(config.locale);

		config.matrix.width = 32;
		config.matrix.height = 32;
		config.matrix.defaults.text.font = 'Century-Gothic-Bold-Italic';

		matrix.init();

		matrix.idle(function() {
			//displayQuotes(_quotes);
			displayFika();
		});
		
		scheduleQuotes();
		scheduleClock();
		scheduleInterrupts();
		
	}
	
}



var app = new App();
app.run();


