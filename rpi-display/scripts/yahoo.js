var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');
var extend   = require('extend');
var sprintf  = require('./sprintf.js');

var yahoo = module.exports;

function YQL(query, callback) {

	var options = {};
	
	options.format   = 'json';
	options.env      = 'store://datatables.org/alltableswithkeys';
	options.callback = '';
	options.q        = query;
	
	var params = '';
	
	for (var key in options) {
		if (params != '')
			params += '&';
			
		params += key + '=' + encodeURIComponent(options[key]);
	}	

	var url = 'https://query.yahooapis.com/v1/public/yql?' + params;

	request(url, function (error, response, body) {
		try {
			if (error)
				throw error;

			if (response.statusCode == 200) {
				callback(JSON.parse(body));
			}
			else {
				throw new Error('Invalid status code');
			}
		}
		catch(error) {
			console.log(error);
			callback();
		}
		
	});
};


yahoo.Quotes = function(symbols) {

	var _this = this;


	_this.fetch = function() {
		
		var tickers = [];
		var map = {};
		
		symbols.forEach(function(symbol) {
			tickers.push('"' + symbol.symbol + '"');
			map[symbol.symbol] = symbol;
			
		});
		
		var query = sprintf('SELECT * FROM yahoo.finance.quotes WHERE symbol IN(%s)', tickers.join(','));
		
		YQL(query, function(data){
			if (data != undefined) {
				var items = data.query.results.quote;
	
				if (!util.isArray(items))
					items = [items];
	
				var quotes = [];
				
				items.forEach(function(item) {

					var quote = {};

					extend(quote, map[item.symbol]);
					
					quote.price     = parseFloat(item.LastTradePriceOnly);
					quote.change    = parseFloat(item.PercentChange != null ? item.PercentChange : 0);
					quote.volume    = parseInt(item.Volume);


					quotes.push(quote);
				});
				
				_this.emit('quotes', quotes);
				
			}
			
		});
	}
};


yahoo.Rates = function(symbols) {

	var _this = this;

	_this.fetch = function() {
		
		var tickers = [];
		var map = {};
		
		symbols.forEach(function(symbol) {
			tickers.push('"' + symbol.symbol + '"');
			map[symbol.symbol] = symbol;
			
		});

		var query = sprintf('SELECT * FROM yahoo.finance.xchange WHERE pair IN(%s)', tickers.join(','));
		
		YQL(query, function(data){
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
				
				_this.emit('rates', rates);
				
			}
			
		});
	}
};

util.inherits(yahoo.Rates, events.EventEmitter);
util.inherits(yahoo.Quotes, events.EventEmitter);


