var request  = require('request');
var util     = require('util');
var moment   = require('moment');
var schedule = require('node-schedule');
var events   = require('events');
var sprintf  = require('./sprintf');

var YQL      = require('./yql.js');
var sprintf  = require('./sprintf.js');


var Weather = function(config) {

	var _this = this;

	// Default LUND
	if (config.woeid == undefined)
		config.woeid = '12883682';

	function toCelsius(fahrenheit) {
	    return (5 / 9) * (fahrenheit - 32);
	}

	function toCapitalize(string) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}	

	
	function getConditionFromCode(code) {
	
		var table = {
			0:  {name: 'tornado',                 text: 'Tornado',                          image: 'thunder'},
			1:  {name: 'tropical-storm',          text: 'Tropisk storm',                    image: 'thunder'},
			2:  {name: 'hurricane',               text: 'Orkan',                            image: 'thunder'},
			3:  {name: 'severe-thunderstorms',    text: 'Kraftigt åskväder',                image: 'thunder'},
			4:  {name: 'thunderstorms',           text: 'Åska',                             image: 'thunder'},
			5:  {name: 'mixed-rain-and-snow',     text: 'Snöblandat regn',                  image: 'rain-and-snow'},
			6:  {name: 'mixed-rain-and-sleet',    text: 'Blandat regn och snöblandat regn', image: 'rain-and-snow'},
			7:  {name: 'mixed-snow-and-sleet',    text: 'Blandad snö och slask',            image: 'rain-and-snow'},
			8:  {name: 'freezing-drizzle',        text: 'Fryst duggregn',           image: 'rain-and-snow'},
			9:  {name: 'drizzle',                 text: 'Duggregn',                 image: 'rain'},
			10: {name: 'freezing-rain',           text: 'Kallt regn',               image: 'rain-and-snow'},
			11: {name: 'showers',                 text: 'Regnigt',                  image: 'rain'},
			12: {name: 'showers',                 text: 'Regnigt',                  image: 'rain'},
			13: {name: 'snow-flurries',           text: 'Snöbyar',                  image: 'snow'},
			14: {name: 'light-snow-showers',      text: 'Lätt snöfall',             image: 'snow'},
			15: {name: 'blowing-snow',            text: 'Snöyra',                   image: 'snow'},
			16: {name: 'snow',                    text: 'Snö',                      image: 'snow'},
			17: {name: 'hail',                    text: 'Hagel',                    image: 'rain-and-snow'},
			18: {name: 'sleet',                   text: 'Slask',                    image: 'rain-and-snow'},
			19: {name: 'dust',                    text: 'Disigt',                   image: 'cloudy'},
			20: {name: 'foggy',                   text: 'Dimmigt',                  image: 'cloudy'},
			21: {name: 'haze',                    text: 'Disigt',                   image: 'cloudy'},
			22: {name: 'smoky',                   text: 'Rökigt',                   image: 'cloudy'},
			23: {name: 'blustery',                text: 'Stormigt',                 image: 'windy'},
			24: {name: 'windy',                   text: 'Blåsigt',                  image: 'windy'},
			25: {name: 'cold',                    text: 'Kallt',                    image: 'snow'},
			26: {name: 'cloudy',                  text: 'Molnigt',                  image: 'cloudy'},
			27: {name: 'mostly-cloudy-night',     text: 'Mestadels moln',           image: 'cloudy'},
			28: {name: 'mostly-cloudy-day',       text: 'Mestadels moln',           image: 'cloudy'},
			29: {name: 'partly-cloudy-night',     text: 'Delvis molnigt',           image: 'cloudy'},
			30: {name: 'partly-cloudy-day',       text: 'Delvis molnigt',           image: 'cloudy'},
			31: {name: 'clear-night',             text: 'Klart',                    image: 'sunny'},
			32: {name: 'sunny',                   text: 'Soligt',                   image: 'sunny'},
			33: {name: 'fair-night',              text: 'Uppehåll',                 image: 'partly-sunny'},
			34: {name: 'fair-day',                text: 'Uppehåll',                 image: 'partly-sunny'},
			35: {name: 'mixed-rain-and-hail',     text: 'Regn och hagel',           image: 'rain'},
			36: {name: 'hot',                     text: 'Varmt',                    image: 'sunny'},
			37: {name: 'isolated-thunderstorms',  text: 'Enstaka åskväder',         image: 'thunder'},
			38: {name: 'scattered-thunderstorms', text: 'Åska',                     image: 'thunder'},
			39: {name: 'scattered-thunderstorms', text: 'Åska',                     image: 'thunder'},
			40: {name: 'scattered-showers',       text: 'Delvis regn',              image: 'rain'},
			41: {name: 'heavy-snow',              text: 'Mycket snöigt',            image: 'snow'},
			42: {name: 'scattered-snow-showers',  text: 'Spridda snöbyar',          image: 'snow'},
			43: {name: 'heavy-snow',              text: 'Mycket snö',               image: 'snow'},
			44: {name: 'partly-cloudy',           text: 'Delvis molnigt',           image: 'partly-sunny'},
			45: {name: 'thundershowers',          text: 'Regnigt',                  image: 'rain'},
			46: {name: 'snow-showers',            text: 'Snöigt',                   image: 'snow'},
			47: {name: 'isolated-thundershowers', text: 'Delvis regn',              image: 'partly-rain'},
			
			3200: {name: 'not-available', text: 'Hmm'}
		};
	
		code = parseInt(code);
	
		return table[code] != undefined ? table[code] : sprintf('Väderkod %s', code);
	}
		
	
	
	_this.fetch = function() {
		
		var query = sprintf('SELECT * FROM weather.forecast WHERE woeid = %s', config.woeid);
		var yql = new YQL();
	
		yql.request(query, function(data){
			if (data != undefined) {
				var channel = data.query.results.channel;
				
				var items = [];

				channel.item.forecast.forEach(function(day) {
					var lookup   = getConditionFromCode(day.code);
					var date     = new Date(moment(day.date, 'DD MMM YYYY').valueOf());
					
					var item = {};
					item.high      = toCelsius(day.high);
					item.low       = toCelsius(day.low);
					item.date      = date;
					item.day       = toCapitalize(moment(date).format("dddd"));
					item.condition = lookup.text;
					item.image     = lookup.image;
					item.code      = day.code;
					
					items.push(item);
					
				});

				items[0].day = 'Idag';
				items[1].day = 'I morgon';
				
				_this.emit('forecast', items);			
			}
			
		});
	}
	
	moment.locale('sv');

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


util.inherits(Weather, events.EventEmitter);


