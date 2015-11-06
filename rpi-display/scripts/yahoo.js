var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');
var extend   = require('extend');
var moment   = require('moment');

var sprintf  = require('./sprintf.js');

var yahoo = module.exports;

function YQL(query, callback) {

	var options = {};
	
	options.format   = 'json';
	options.env      = 'store://datatables.org/alltableswithkeys';
	options.callback = '';
	options.lang     = 'sv-se';
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




yahoo.Weather = function(woeid) {

	var _this = this;

	// Default LUND
	if (woeid == undefined)
		woeid = '12883682';

	function toCelsius(fahrenheit) {
	    return (5 / 9) * (fahrenheit - 32);
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
		
		var query = sprintf('SELECT * FROM weather.forecast WHERE woeid = %s', woeid);
		
		YQL(query, function(data){
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
					item.day       = moment(date).format("dddd");
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


};

util.inherits(yahoo.Weather, events.EventEmitter);


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
					
					quote.price     = item.LastTradePriceOnly != null ? parseFloat(item.LastTradePriceOnly) : null;
					quote.change    = item.PercentChange != null ? parseFloat(item.PercentChange) : null;
					quote.volume    = item.Volume != null ? parseInt(item.Volume) : null;


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


/*

<yahoo-weather-codes>
  <code number="0" description="tornado"/>
  <code number="1" description="tropical storm"/>
  <code number="2" description="hurricane"/>
  <code number="3" description="severe thunderstorms"/>
  <code number="4" description="thunderstorms"/>
  <code number="5" description="mixed rain and snow"/>
  <code number="6" description="mixed rain and sleet"/>
  <code number="7" description="mixed snow and sleet"/>
  <code number="8" description="freezing drizzle"/>
  <code number="9" description="drizzle"/>
  <code number="10" description="freezing rain"/>
  <code number="11" description="showers"/>
  <code number="12" description="showers"/>
  <code number="13" description="snow flurries"/>
  <code number="14" description="light snow showers"/>
  <code number="15" description="blowing snow"/>
  <code number="16" description="snow"/>
  <code number="17" description="hail"/>
  <code number="18" description="sleet"/>
  <code number="19" description="dust"/>
  <code number="20" description="foggy"/>
  <code number="21" description="haze"/>
  <code number="22" description="smoky"/>
  <code number="23" description="blustery"/>
  <code number="24" description="windy"/>
  <code number="25" description="cold"/>
  <code number="26" description="cloudy"/>
  <code number="27" description="mostly cloudy (night)"/>
  <code number="28" description="mostly cloudy (day)"/>
  <code number="29" description="partly cloudy (night)"/>
  <code number="30" description="partly cloudy (day)"/>
  <code number="31" description="clear (night)"/>
  <code number="32" description="sunny"/>
  <code number="33" description="fair (night)"/>
  <code number="34" description="fair (day)"/>
  <code number="35" description="mixed rain and hail"/>
  <code number="36" description="hot"/>
  <code number="37" description="isolated thunderstorms"/>
  <code number="38" description="scattered thunderstorms"/>
  <code number="39" description="scattered thunderstorms"/>
  <code number="40" description="scattered showers"/>
  <code number="41" description="heavy snow"/>
  <code number="42" description="scattered snow showers"/>
  <code number="43" description="heavy snow"/>
  <code number="44" description="partly cloudy"/>
  <code number="45" description="thundershowers"/>
  <code number="46" description="snow showers"/>
  <code number="47" description="isolated thundershowers"/>
  <code number="3200" description="not available"/>
</yahoo-weather-codes>

*/

