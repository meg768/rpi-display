var schedule = require('node-schedule');
var util     = require('util');
var minimist = require('minimist');

var config   = require('./scripts/config.js');
var sprintf  = require('./scripts/sprintf.js');
var random   = require('./scripts/random.js');
var matrix   = require('./scripts/matrix.js');



matrix.idle = function() {

	//cmd = matrix.text('HEJ');
	//matrix.start(cmd);
	
	var display = new matrix.Display();
	display.text('XXX');
	display.send();
	
}	


function clock() {
	var colors = require('./scripts/colors.js');
	var rule = new schedule.RecurrenceRule();

	rule.minute = new schedule.Range(0, 59, 5);
		
	schedule.scheduleJob(rule, function() {
		var display = new matrix.Display();
		var now = new Date();
		
		var options = {};
		options.size = 40;
		options.color = sprintf('rgb(%d,%d,%d)', 255, 0, 0);

		display.text(sprintf('%02d:%02d', now.getHours(), now.getMinutes()), options);	
		display.send();	
	});
}


function quotes(tickers) {

	// 			{ id: 'PHI.ST',  name: 'PHI', currency: 'SEK'}

	var numeral = require('numeral');

	var config = {
		tickers : [
			{ id: 'PHI.ST',  name: 'PHI', currency: 'SEK'}
		]
	};
	
	var Quotes = require('./scripts/quotes.js');
	var quotes = new Quotes(config);

	quotes.on('quotes', function(quotes) {
		
		console.log('QUOTES', quotes);


		var display = new matrix.Display();
		var now = new Date();
		var space = '   ';
		
		var options = {};
		
		quotes.forEach(function(quote) {


			if (quote.change == 0)
				options.color = 'rgb(0,0,255)';
			if (quote.change < 0)
				options.color = 'rgb(255,0,0)';
			if (quote.change > 0)
				options.color = 'rgb(0,255,0)';
			

			var text = '';

			text += quote.name + space;
			text += numeral(quote.change).format('+0.0') + '%' + space;

			if (quote.currency != undefined) {
				text += numeral(quote.price).format('0,000.00') + space;
			}

			display.text(text, options);

		});
		
			
		display.send();
		
	});
	
	this.run = function() {
		quotes.fetch();
	}
	
	
}


function rss(feeds) {
	
	//{url: 'http://www.di.se/rss', name:'Di'}, 

	var config = {
		feeds: feeds
	};
	
	var rss = new RSS(config);

	rss.on('rss', function(rss) {
		console.log('RSS:', messages);

		var display = new matrix.Display();
		var options = {};
		
		options.color = 'rgb(0,0,255)';
		
		display.text(sprintf('Nyheter från %s', messages[0].name));
		
		messages.forEach(function(message) {
			var text = '';
			
			if (message.category != undefined)
				text += message.category;
				
			if (text != '')
				text += ' - ';
				
			if (message.title != undefined)
				text += message.title; 
				
			display.text(text, options);
					
		});
		
		display.send();	
	});
	
}


function loop() {
	var rule = new schedule.RecurrenceRule();

	var activities = [];
	var index = 0;
	
	
	if (true) {
		var numeral = require('numeral');

		var config = {
			tickers : [
				{ id: 'PHI.ST',  name: 'PHI', currency: 'SEK'}
			]
		};
		
		var Quotes = require('./scripts/quotes.js');
		var quotes = new Quotes(config);
	
		quotes.on('quotes', function(quotes) {
			
			console.log('QUOTES', quotes);


			var display = new matrix.Display();
			var now = new Date();
			var space = '   ';
			
			var options = {};
			
			quotes.forEach(function(quote) {


				if (quote.change == 0)
					options.color = 'rgb(0,0,255)';
				if (quote.change < 0)
					options.color = 'rgb(255,0,0)';
				if (quote.change > 0)
					options.color = 'rgb(0,255,0)';
				

				var text = '';

				text += quote.name + space;
				text += numeral(quote.change).format('+0.0') + '%' + space;

				if (quote.currency != undefined) {
					text += numeral(quote.price).format('0,000.00') + space;
				}

	
				display.text(text, options);
	
			});
			
				
			display.send();
			
		});
		
		activities.push(quotes);				

	}
	
	
	if (true) {
		var RSS = require('./scripts/rss.js');

		function display(messages) {
			console.log('RSS:', messages);

			var display = new matrix.Display();
			var options = {};
			
			options.color = 'rgb(0,0,255)';
			
			display.text(sprintf('Nyheter från %s', messages[0].name));
			
			messages.forEach(function(message) {
				var text = '';
				
				if (message.category != undefined)
					text += message.category;
					
				if (text != '')
					text += ' - ';
					
				if (message.title != undefined)
					text += message.title; 
					
				display.text(text, options);
						
			});
			
			display.send();
			
		}

		if (true) {
			var config = {
				feeds: [
					{url: 'http://www.di.se/rss', name:'Di'}, 
				]
			};
			
			var rss = new RSS(config);
		
			rss.on('rss', function(rss) {
				display(rss);
			});
	
			activities.push(rss);				
		}

		if (true) {
			var config = {
				feeds: [
					{url: 'http://www.sydsvenskan.se/rss.xml', name:'Sydsvenskan'}, 
				]
			};
			
			var RSS = require('./scripts/rss.js');
			var rss = new RSS(config);
		
			rss.on('rss', function(rss) {
				display(rss);
			});
	
			activities.push(rss);				
		}
	
		
	}

	
	rule.hour   = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
	rule.minute = new schedule.Range(0, 59, 3);
	
	schedule.scheduleJob(rule, function() {

		// Pick an activity
		var activity = activities[index]; //random.choose(activities);
		
		// Fetch it!
		activity.fetch();

		// Move to next		
		index = (index + 1) % activities.length;
	});
	
	
}



function main() {

	// Set the time zone according to config settings
	process.env.TZ = 'Europe/Stockholm';



	config.matrix.config = '64x32';
	config.matrix.defaults.text.font = 'Century-Gothic-Bold-Italic';
		
	 
	function sayHello() {
	
		var display = new matrix.Display();
		
		function getIP(device) {
			var os = require('os');
			var ifaces = os.networkInterfaces();
		
			var iface = ifaces[device];
			
			if (iface != undefined) {
			
				for (var i in iface) {
					var item = iface[i];
			
					if (item.family == 'IPv4')
						return item.address;
				}
			}
		
			return '';
		}
		
		var wlan0 = getIP('wlan0');
		var eth0 = getIP('eth0');

		if (wlan0 != '') {
			display.text(wlan0, {color:'blue'});
		}
			
		if (eth0 != '') {
			display.text(eth0, {color:'blue'});
		}
		
		if (wlan0 != '' || eth0 != '')
			display.emoji(435, {scroll:'horizontal'});

		display.send();		
	}
	  

	sayHello();
	//loop();
	//clock();
}

main();
