var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');
var extend   = require('extend');
var numeral  = require('numeral');

module.exports = function(config) {

	var self = this;

	function pluck(items) {
		var text = '';
		
		for (var index in items) {
			if (text != '')
				text += ', ';
				
			text += '"' + items[index] + '"';
		}		
		
		return text;
	}

	
	function fetch() {
		
		var quotes = config.quotes;
		var symbols = [];
		var info = {};
		
		for (var index in quotes) {
			var quote = quotes[index];
			
			symbols.push(quote.symbol);
			info[quote.symbol] = quote;
		}		
	
		var url = '';
	
		url += 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(';
		url += encodeURIComponent(pluck(symbols));
		url += ')&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';

		request(url, function (error, response, body) {
			try {
				if (error)
					throw error;
					
				if (response.statusCode == 200) {
					var json = JSON.parse(body);
					var results = json.query.results.quote;
					
					if (!util.isArray(results))
						results = [results];
	
					var data = [];
					
					results.forEach(function(result) {
						
						var quote = {};

						extend(quote, info[result.symbol]);
						
						quote.price     = parseFloat(result.LastTradePriceOnly);
						quote.change    = parseFloat(result.PercentChange);
						quote.volume    = parseInt(result.Volume);
						quote.formatted = {};
						
						// Remove some precision
						quote.formatted.price   = parseFloat(quote.price.toPrecision(4));
						quote.formatted.change  = parseFloat(quote.change.toPrecision(3));
						quote.formatted.volume  = parseFloat(quote.volume.toPrecision(4));
		
						// Format
						if (quote.formatted.price >= 1000)
							quote.formatted.price = numeral(quote.formatted.price).format('0,000');
						else
							quote.formatted.price = numeral(quote.formatted.price).format('0,000.0[0]');
							
						// Add currency if specified
						if (quote.currency != undefined)
							quote.formatted.price += ' ' + quote.currency;
							 
						quote.formatted.change  = numeral(quote.formatted.change).format('+0,000.0') + '%';
						quote.formatted.volume  = sprintf('%s', numeral(quote.formatted.volume).format('0,000'));

						data.push(quote);

					});
					
					self.emit('quotes', data);
				}
				else
					throw new Error('Invalid status code');
			}
			catch(error) {
				console.log(error);
					
			}
			
		});
	}
	
	function init() {
		var rule  = new schedule.RecurrenceRule();
	
		if (config.schedule.hour != undefined)
			rule.hour = config.schedule.hour;
		
		if (config.schedule.minute != undefined)
			rule.minute = config.schedule.minute;
		
		if (config.schedule.second != undefined)
			rule.second = config.schedule.second;
	
		schedule.scheduleJob(rule, function() {
			fetch();	
		});
		
	}
	
	init();

	
}

util.inherits(module.exports, events.EventEmitter);



	


