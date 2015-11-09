var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');
var extend   = require('extend');
var moment   = require('moment');

var YQL      = require('./yql.js');
var sprintf  = require('./sprintf.js');


var Quotes = module.exports = function(tickers) {

	var _this = this;

	_this.fetch = function(callback) {
		
		var symbols = [];
		var map = {};
		
		tickers.forEach(function(ticker) {
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
				
				callback(quotes);
				
			}
			
		});
	}
	

			

};




