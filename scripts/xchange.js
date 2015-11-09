var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');
var extend   = require('extend');
var moment   = require('moment');

var YQL      = require('./yql.js');
var sprintf  = require('./sprintf.js');



var Rates = module.exports = function(tickers) {

	var _this = this;

	_this.fetch = function(callback) {
		
		var pairs = [];
		var map = {};
		
		tickers.forEach(function(ticker) {
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
				
				callback(rates);
				
			}
			
		});
	}
	
				
	
};
