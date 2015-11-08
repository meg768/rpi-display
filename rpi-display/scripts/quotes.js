var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');
var extend   = require('extend');
var moment   = require('moment');

var YQL      = require('./yql.js');
var sprintf  = require('./sprintf.js');


var Quotes = module.exports = function(config) {

	var _this = this;

	_this.fetch = function() {
		
		var symbols = [];
		var map = {};
		
		config.tickers.forEach(function(ticker) {
			symbols.push('"' + ticker.id + '"');
			map[ticker.id] = ticker;
		});
		
		var query = sprintf('SELECT * FROM yahoo.finance.quotes WHERE symbol IN(%s)', symbols.join(','));
		var yql = new YQL();
		
		yql.request(query, function(data){
			if (data != undefined) {
				var items = data.query.results.quote;
	
				if (!util.isArray(items))
					items = [items];
	
				var quotes = [];
				
				items.forEach(function(item) {

					var quote = {};

					extend(quote, map[item.symbol]);
					
					quote.price     = item.LastTradePriceOnly != null ? parseFloat(item.LastTradePriceOnly) : null;
					quote.change    = item.PercentChange != null ? parseFloat(item.PercentChange) : null;
					quote.volume    = item.Volume != null ? parseInt(item.Volume) : null;

					quotes.push(quote);
				});
				
				_this.emit('quotes', quotes);
				
			}
			
		});
	}
	

	if (config.schedule != undefined) {
		var rule = new schedule.RecurrenceRule();
	
		if (config.schedule.hour != undefined)
			rule.hour = config.schedule.hour;
	
		if (config.schedule.minute != undefined)
			rule.minute = config.schedule.minute;
	
		if (config.schedule.second != undefined)
			rule.second = config.schedule.second;

		schedule.scheduleJob(rule, function() {
			_this.fetch();
		});		
		
	}
			

};

util.inherits(Quotes, events.EventEmitter);


