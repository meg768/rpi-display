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
	var _quote = [];	


	function displayQuotes() {
		
		if (_quotes.length > 0) {
			var display = new matrix.Display();
			
			_quotes.forEach(function(quote) { 
				var options = {};

				options.color = 'rgb(255, 255, 255';
				display.text(quote.name, options);

				display.text(numeral(quote.price).format('0,000.00'), options);
				
				if (quote.change == 0)
					options.color = 'rgb(0,0,255)';
				if (quote.change < 0)
					options.color = 'rgb(255,0,0)';
				if (quote.change > 0)
					options.color = 'rgb(0,255,0)';
		
				display.text(numeral(quote.change).format('+0.0') + '% ', options);

				options.color = 'rgb(0,0,255)';
				display.text(numeral(quote.volume).format('0,000'), options);
				
			});

			display.send();
			
		}
		
	}
	
	
	function scheduleQuotes() {
	
	
		function fetchQuotes() {
		
			var Quotes = require('./scripts/quotes.js');
			var quotes = new Quotes([{ id: 'PHI.ST',  name: 'PHI', currency: 'SEK'}]);

			quotes.fetch();

			quotes.on('quotes', function(quotes) {
				console.log(quotes);
				_quotes = quotes;
			});
			
		}
	
		var rule = new schedule.RecurrenceRule();
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
		
	}
	
}



var app = new App();
app.run();


