var schedule = require('node-schedule');
var util     = require('util');
var sprintf  = require('./scripts/sprintf.js');
var random   = require('./scripts/random.js');
var matrix   = require('./scripts/matrix.js');

// Set the time zone according to config settings
process.env.TZ = 'Europe/Stockholm';


function enableWeather() {

	var yahoo = require('./scripts/yahoo.js');

	var weather = new yahoo.Weather('12883682');

	weather.on('forecast', function(forecast) {
		console.log(forecast);
		
		forecast.forEach(function(day) {
			
			var display = new matrix.Display();
			display.text(day.day);
			display.text(day.condition);
			display.image('./images/rain.png', {scroll:'horizontal'});

			display.send({priority:'low'});
			console.log(day.image);
		});
	});

	var rule = new schedule.RecurrenceRule();
	rule.second = new schedule.Range(0, 59, 1);
		
	schedule.scheduleJob(rule, function() {
		weather.fetch();
	});


}

function enableQuotes() {

	var symbols = [
		
		{ name:'OMX',  symbol:'^OMX'},
		{ symbol: '^GSPC', name: 'S&P 500'},
		{ symbol: '^IXIC', name: 'NASDAQ'},
		{ name:'PHI',  symbol:'PHI.ST', currency: 'SEK'},
		{ name:'H&M',  symbol:'HM-B.ST', currency: 'SEK'}
		
	];
		

	var yahoo = require('./scripts/yahoo.js');

	var quotes = new yahoo.Quotes(symbols);

	quotes.on('quotes', function(quotes) {
		console.log(quotes);
	});

	var rule = new schedule.RecurrenceRule();
	rule.second = new schedule.Range(0, 59, 15);
		
	schedule.scheduleJob(rule, function() {
		quotes.fetch();
	});


}


function enableRates() {

	var symbols = [
		{ name:'USD/SEK', symbol:'USDSEK' },
		{ name:'EUR/SEK', symbol:'EURSEK' },
		{ name:'EUR/USD', symbol:'EURUSD' },
	];
		

	var yahoo = require('./scripts/yahoo.js');

	var rates = new yahoo.Rates(symbols);

	rates.on('rates', function(rates) {
		console.log(rates);
	});

	var rule = new schedule.RecurrenceRule();
	rule.second = new schedule.Range(0, 59, 15);
		
	schedule.scheduleJob(rule, function() {
		rates.fetch();
	});


}

enableWeather();
//enableRates();
//enableQuotes();
 	
