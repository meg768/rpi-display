var request  = require('request');
var util     = require('util');
var moment   = require('moment');
var schedule = require('node-schedule');
var events   = require('events');
var sprintf  = require('./sprintf');


module.exports = function(config) {
	
	var self = this;
	var url  = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22Lund%2C%20Sweden%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

	function convertFarenheightToCelcius(farenheight) {
		return Math.round((farenheight - 32) / 1.8);
	}
	
	function getConditionFromCode(code) {
	
		var table = {
			0:  {name: 'tornado',                 text: 'Tornado',                          image: 'tornado'},
			1:  {name: 'tropical-storm',          text: 'Tropisk storm',                    image: 'tornado'},
			2:  {name: 'hurricane',               text: 'Orkan',                            image: 'tornado'},
			3:  {name: 'severe-thunderstorms',    text: 'Kraftigt åskväder',                image: 'thunder'},
			4:  {name: 'thunderstorms',           text: 'Åska',                             image: 'thunder'},
			5:  {name: 'mixed-rain-and-snow',     text: 'Snöblandat regn',                  image: 'rain-and-snow'},
			6:  {name: 'mixed-rain-and-sleet',    text: 'Blandat regn och snöblandat regn', image: 'rain-and-snow'},
			7:  {name: 'mixed-snow-and-sleet',    text: 'Blandad snö och slask',            image: 'rain-and-snow'},
			8:  {name: 'freezing-drizzle',        text: 'Fryst duggregn',           image: 'rain-and-snow'},
			9:  {name: 'drizzle',                 text: 'Duggregn',                 image: 'drizzle'},
			10: {name: 'freezing-rain',           text: 'Kallt regn',               image: 'rain-and-snow'},
			11: {name: 'showers',                 text: 'Regnigt',                  image: 'rain'},
			12: {name: 'showers',                 text: 'Regnigt',                  image: 'rain'},
			13: {name: 'snow-flurries',           text: 'Snöbyar',                  image: 'snow'},
			14: {name: 'light-snow-showers',      text: 'Lätt snöfall',             image: 'partly-snow'},
			15: {name: 'blowing-snow',            text: 'Snöyra',                   image: 'snow'},
			16: {name: 'snow',                    text: 'Snö',                      image: 'snow'},
			17: {name: 'hail',                    text: 'Hagel',                    image: 'rain-and-snow'},
			18: {name: 'sleet',                   text: 'Slask',                    image: 'rain-and-snow'},
			19: {name: 'dust',                    text: 'Disigt',                   image: 'foggy'},
			20: {name: 'foggy',                   text: 'Dimmigt',                  image: 'foggy'},
			21: {name: 'haze',                    text: 'Disigt',                   image: 'foggy'},
			22: {name: 'smoky',                   text: 'Rökigt',                   image: 'foggy'},
			23: {name: 'blustery',                text: 'Stormigt',                 image: 'windy'},
			24: {name: 'windy',                   text: 'Blåsigt',                  image: 'windy'},
			25: {name: 'cold',                    text: 'Kallt',                    image: 'snow'},
			26: {name: 'cloudy',                  text: 'Molnigt',                  image: 'cloudy'},
			27: {name: 'mostly-cloudy-night',     text: 'Mestadels moln',           image: 'mostly-cloudy'},
			28: {name: 'mostly-cloudy-day',       text: 'Mestadels moln',           image: 'mostly-cloudy'},
			29: {name: 'partly-cloudy-night',     text: 'Delvis molnigt',           image: 'partly-cloudy'},
			30: {name: 'partly-cloudy-day',       text: 'Delvis molnigt',           image: 'partly-cloudy'},
			31: {name: 'clear-night',             text: 'Klart',                    image: 'sunny'},
			32: {name: 'sunny',                   text: 'Soligt',                   image: 'sunny'},
			33: {name: 'fair-night',              text: 'Uppehåll',                 image: 'partly-cloudy'},
			34: {name: 'fair-day',                text: 'Uppehåll',                 image: 'partly-cloudy'},
			35: {name: 'mixed-rain-and-hail',     text: 'Regn och hagel',           image: 'rain-and-hail'},
			36: {name: 'hot',                     text: 'Varmt',                    image: 'sunny'},
			37: {name: 'isolated-thunderstorms',  text: 'Enstaka åskväder',         image: 'thunder'},
			38: {name: 'scattered-thunderstorms', text: 'Åska',                     image: 'thunder'},
			39: {name: 'scattered-thunderstorms', text: 'Åska',                     image: 'thunder'},
			40: {name: 'scattered-showers',       text: 'Delvis regn',              image: 'partly-rain'},
			41: {name: 'heavy-snow',              text: 'Mycket snöigt',            image: 'heavy-snow'},
			42: {name: 'scattered-snow-showers',  text: 'Spridda snöbyar',          image: 'partly-snow'},
			43: {name: 'heavy-snow',              text: 'Mycket snö',               image: 'heavy-snow'},
			44: {name: 'partly-cloudy',           text: 'Delvis molnigt',           image: 'partly-cloudy'},
			45: {name: 'thundershowers',          text: 'Regnigt',                  image: 'rain'},
			46: {name: 'snow-showers',            text: 'Snöigt',                   image: 'snow'},
			47: {name: 'isolated-thundershowers', text: 'Delvis regn',              image: 'partly-rain'},
			
			3200: {name: 'not-available', text: 'Hmm'}
		};
	
		code = parseInt(code);
	
		return table[code] != undefined ? table[code] : sprintf('Väderkod %s', code);
	}
	
	self.fetch = function() {
	
		console.log('Fetching weather...');
		request(url, function (error, response, body) {
			try {
				if (error)
					throw error;
					
				if (response.statusCode == 200) {
					var json = JSON.parse(body);
					var results = json.query.results.channel;
					var forecast = results.item.forecast;
					
					var items = [];
	
					for (var index in forecast) {
						var item = {};
						var weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag']; 
						var lookup   = getConditionFromCode(forecast[index].code);
	
						item.high      = convertFarenheightToCelcius(forecast[index].high);
						item.low       = convertFarenheightToCelcius(forecast[index].low);
						item.date      = new Date(moment(forecast[index].date, 'DD MMM YYYY').valueOf());
						item.day       = weekdays[item.date.getDay()];
						item.condition = lookup.text;
						item.image     = lookup.image;
						item.code      = forecast[index].code;
						
						items.push(item);
					} 
	
					items[0].day = 'Idag';
					items[1].day = 'I morgon';
					
					for (var index in items) {
						self.emit('forecast', items[index]);
					} 
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
		if (typeof config.schedule == 'object') {
			var rule = new schedule.RecurrenceRule();		
			
			if (config.schedule.minute != undefined)
				rule.minute = config.schedule.minute;
	
			if (config.schedule.hour != undefined)
				rule.hour = config.schedule.hour;
		
			var job = schedule.scheduleJob(rule, function() {
				self.fetch();
			});
			
		}
		
	}

	init();	
}


util.inherits(module.exports, events.EventEmitter);



