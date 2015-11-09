var schedule = require('node-schedule');
var util     = require('util');
var minimist = require('minimist');
var numeral  = require('numeral');

var config   = require('./scripts/config.js');
var sprintf  = require('./scripts/sprintf.js');
var random   = require('./scripts/random.js');
var matrix   = require('./scripts/matrix.js');


function App() {

	var _this = this;
	var _quotes = [];	


	function displayQuotes() {
		
		if (_quotes.length > 0) {
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
				display.text('(' + numeral(quote.volume).format('0,000') + ')', options);
				
			});

			display.send();
			
		}
		
	}
	
	function scheduleClock() {
		var rule = new schedule.RecurrenceRule();
	
		rule.minute = new schedule.Range(0, 59, 5);
		
		schedule.scheduleJob(rule, function() {
			var display = new matrix.Display();
			var now = new Date();

			var options = {};
			options.color = 'rgb(255, 0, 0)';
			options.size = 24; //
	
			display.text(sprintf('%02d:%02d', now.getHours(), now.getMinutes()), options);	
			display.send();	
		});
	}
	
	function scheduleQuotes() {
	
	
		function fetchQuotes() {
		
			var Quotes = require('./scripts/quotes.js');
			var quotes = new Quotes([{ id: 'PHI.ST',  name: 'PHI', currency: 'SEK', logo:'./images/phi/logo.png'}]);

			quotes.fetch();

			quotes.on('quotes', function(quotes) {
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
		process.env.TZ = 'Europe/Stockholm';
	

		config.matrix.config = '32x32';
		config.matrix.defaults.text.font = 'Century-Gothic-Bold-Italic';

		matrix.idle = displayQuotes;
		matrix.init();
		
		scheduleQuotes();
		scheduleClock();
		
	}
	
}



var app = new App();
app.run();


