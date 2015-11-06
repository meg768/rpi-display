var util     = require('util');
var events   = require('events');
var schedule = require('node-schedule');
var extend   = require('extend');

var YQL      = require('./yql.js');
var sprintf  = require('./sprintf.js');


var RSS = module.exports = function(config) {

	var _this = this;

	_this.fetch = function(feed) {
		
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
	
				var rss = {};
				extend(rss, feed.tags, {messages:[]});
				
				items.forEach(function(item) {

					var message = {};

					message.title    = item.title;
					message.category = item.category;

					rss.messages.push(message);
				});
				
				_this.emit('rss', rss);
				
			}
			
		});
	}
	
	config.feeds.forEach(function(feed) {

		var rule = new schedule.RecurrenceRule();

		if (feed.schedule != undefined) {
		
			if (feed.schedule.hour != undefined)
				rule.hour = feed.schedule.hour;
		
			if (feed.schedule.minute != undefined)
				rule.minute = feed.schedule.minute;
		
			if (feed.schedule.second != undefined)
				rule.second = feed.schedule.second;
		}
				
		schedule.scheduleJob(rule, function() {
			_this.fetch(feed);
		});	
		
	});
	
};

util.inherits(RSS, events.EventEmitter);