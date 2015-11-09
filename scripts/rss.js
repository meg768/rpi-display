var util     = require('util');
var events   = require('events');
var schedule = require('node-schedule');
var extend   = require('extend');

var YQL      = require('./yql.js');
var sprintf  = require('./sprintf.js');


var RSS = module.exports = function(feeds) {

	var _this = this;

	_this.fetch = function(callback) {
		
		feeds.forEach(function(feed) {

			var query = '';
	
			query += sprintf('SELECT title, category FROM rss WHERE url="%s"', feed.url);
			query += sprintf(' | sort(field="pubDate", descending="true")');
			query += sprintf(' | truncate(count=%d)', 3);
	
			var yql = new YQL();
			
			yql.request(query, function(data){
				if (data != undefined) {
					var items = data.query.results.item;
		
					if (!util.isArray(items))
						items = [items];
		
					var rss = [];
					
					items.forEach(function(item) {
	
						var message = {};
	
						extend(message, feed);
						
						message.title    = item.title;
						message.category = item.category;
	
						rss.push(message);
					});
					
					callback(rss);
					
				}
				
			});
			
		});
	}
	

};

