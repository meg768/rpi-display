var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');
var extend   = require('extend');
var moment   = require('moment');

var YQL      = require('./yql.js');
var sprintf  = require('./sprintf.js');



var Rates = module.exports = function(config) {

	var _this = this;

	_this.fetch = function() {
		
		var pairs = [];
		var map = {};
		
		config.tickers.forEach(function(ticker) {
			pairs.push('"' + ticker.id + '"');
			map[ticker.id] = ticker.tags;
		});

		var query = sprintf('SELECT * FROM yahoo.finance.xchange WHERE pair IN(%s)', pairs.join(','));
		var yql = new YQL();
		
		yql.request(query, function(data){
			if (data != undefined) {
				var items = data.query.results.rate;
				
				if (!util.isArray(items))
					items = [items];
	
				var rates = [];
				
				items.forEach(function(item) {
					var rate = {};
					extend(rate, map[item.id], {value:parseFloat(item.Rate)});
											
					rates.push(rate);
				});
				
				_this.emit('xchange', rates);
				
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

util.inherits(Rates, events.EventEmitter);
/*
	
var Quotes = module.exports = function(config) {

	var _this = this;

	_this.fetch = function() {
		
		var symbols = [];
		var map = {};
		
		config.tickers.forEach(function(ticker) {
			symbols.push('"' + ticker.id + '"');
			map[ticker.id] = ticker.tags;
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
*/



