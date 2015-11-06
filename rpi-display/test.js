var schedule = require('node-schedule');
var util     = require('util');
var sprintf  = require('./scripts/sprintf.js');
var random   = require('./scripts/random.js');
var matrix   = require('./scripts/matrix.js');
var extend   = require('extend');

// Set the time zone according to config settings
process.env.TZ = 'Europe/Stockholm';

/*
	
			{name: 'SvD',    url: 'http://www.svd.se/?service=rss&type=senastenytt'}, 
			{name: 'SDS',    url: 'http://www.sydsvenskan.se/rss.xml'}, 
			{name: 'Di',     url: 'http://www.di.se/rss'}, 
			{name: 'Google', url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss'}
*/

function enableRSS() {

	var config = {
		feeds: [
			{
				url: 'http://www.di.se/rss', 
				tags: { name: 'Di' },
				
				schedule: {
					minute: new schedule.Range(0, 59, 1)
				}
				
				
			},
			{
				url: 'http://www.svd.se/?service=rss&type=senastenytt',
				tags: {name: 'SvD' },

				schedule: {
					minute: new schedule.Range(0, 59, 1)
				}
			}
			
		]
	};
	
	var RSS = require('./scripts/rss.js');
	var rss = new RSS(config);

	rss.on('rss', function(rss) {
		console.log('RSS:', rss);
		/*
		var display = new matrix.Display();
		
		forecast.forEach(function(day) {

			display.text(day.day);
			display.text(day.condition);
			display.image(sprintf('./images/weather/%s.png', day.image), {scroll:'horizontal'});

			
			console.log(day.condition);
		});
		
		display.send({priority:'low'});
		*/
	});


}

function enableWeather() {

	var yahoo = require('./scripts/yahoo.js');

	var weather = new yahoo.Weather('12883682');

	weather.on('forecast', function(forecast) {
		console.log(forecast);
		
		var display = new matrix.Display();
		
		forecast.forEach(function(day) {

			display.text(day.day);
			display.text(day.condition);
			display.image(sprintf('./images/weather/%s.png', day.image), {scroll:'horizontal'});

			
			console.log(day.condition);
		});
		
		display.send({priority:'low'});
	});

	var rule = new schedule.RecurrenceRule();
	rule.second = new schedule.Range(0, 59, 1);
		
	schedule.scheduleJob(rule, function() {
		weather.fetch();
	});


}

function enableQuotes() {

	var config = {
		tickers: [
			{ id:'^OMX',    tags:{name: 'OMX Index'}},
			{ id:'^GSPC',   tags:{name: 'S&P 500'}},
			{ id:'^IXIC',   tags:{name: 'NASDAQ'}},
			{ id:'PHI.ST',  tags:{name: 'PHI', currency: 'SEK'}},
			{ id:'HM-B.ST', tags:{name: 'H&M', currency: 'SEK'}}
			
		],
		
		schedule: {
			minute: new schedule.Range(0, 59, 1)
		}
		
	};
		

	var Quotes = require('./scripts/quotes.js');
	var quotes = new Quotes(config);

	quotes.on('quotes', function(quotes) {
		console.log(quotes);
	});


}


function enableRates() {

	var config = {
		tickers: [
			{ id:'USDSEK', tags: {name: 'USD/SEK'} },
			{ id:'EURSEK', tags: {name: 'EUR/SEK'} },
			{ id:'EURUSD', tags: {name: 'UER/USD'} },
			
		],
		
		schedule: {
			minute: new schedule.Range(0, 59, 1)
		}
		
	};
	var Rates = require('./scripts/xchange.js');
	var rates = new Rates(config);

	rates.on('xchange', function(xchange) {
		console.log(xchange);
	});



}

enableRSS();
//enableWeather();
//enableRates();
//enableQuotes();
 	
