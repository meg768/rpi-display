var util     = require('util');
var events   = require('events');
var extend   = require('extend');
var sprintf  = require('./sprintf.js');
var random   = require('./random.js');

var Queue    = require('./queue.js');
var Process  = require('./process.js');
var config   = require('./config.js');

var _process = new Process();
var _queue   = new Queue();
var _idle    = undefined;

var Matrix = module.exports = {};


Matrix.init = function() {

	var display = new Matrix.Display();
	
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
	else
		display.text('Network connection missing.');

	display.send();		
}


Matrix.idle = function(idle) {

	_idle = idle;
}


Matrix.defaultOptions = function(name, opts) {
	
	var options = {};
	
	if (config.matrix.defaults != undefined)
		extend(options, config.matrix.defaults[name]);

	return extend(options, opts);
}


Matrix.start = function(cmd, callback) {

	if (callback == undefined) {
		callback = function() {
		};
	}
		
	if (config.matrix.debug) {
		//console.log('Executing:' , cmd);
		setTimeout(function() {
			callback();
		}, 1);
		
	}
	else {
		if (cmd != undefined)			
			_process.start(cmd.command, cmd.args, cmd.options, callback);	
		else
			callback();
	}
}


Matrix.stop = function() {

	if (config.matrix.debug) {
	}
	else {
		_process.stop();	
	}
}


Matrix.text = function(text, options) {

	options = Matrix.defaultOptions('text', options);

	if (text == '')
		text = 'ABC 123';
		
	var args = [];

	args.push('--config');
	args.push(sprintf('%dx%d', config.matrix.width, config.matrix.height));

	args.push('--text');
	args.push(text);
	
	if (options.color != undefined) {
		args.push('--color');
		args.push(options.color);			
	}	

	if (options.font != undefined) {
		args.push('--font');
		args.push(sprintf('./%s/%s.ttf', config.matrix.paths.fonts, options.font));			
	}	

	if (options.size != undefined) {
		args.push('--size');
		args.push(options.size);			
	}	

	if (options.delay != undefined) {
		args.push('--delay');
		args.push(options.delay);			
	}	

	return {command:'./matrix/run-text', args:args, options:{}};
}


Matrix.image = function(file, options) {

	options = Matrix.defaultOptions('image', options);
	
	var args = [];
	
	args.push('--config');
	args.push(sprintf('%dx%d', config.matrix.width, config.matrix.height));

	args.push('--file');
	args.push(file);

	if (options.delay != undefined) {
		args.push('--delay');
		args.push(options.delay);			
	}	

	if (options.scroll != undefined) {
		args.push('--scroll');
		args.push(options.scroll);			
	}	

	return {command:'./matrix/run-image', args:args, options:{}};
}


Matrix.animation = function(options) {
	
	options = Matrix.defaultOptions('animation', options);

	var args = [];

	args.push('--config');
	args.push(sprintf('%dx%d', config.matrix.width, config.matrix.height));


	if (options.file == undefined) {
		options.file = config.matrix.paths.animations;
	}

	if (options.file != undefined) {
		args.push('--file');
		args.push(options.file);			
	}		
	
	if (options.duration != undefined) {
		args.push('--duration');
		args.push(options.duration);			
	}		

	if (options.delay != undefined) {
		args.push('--delay');
		args.push(options.delay);			
	}		

	if (options.iterations != undefined) {
		args.push('--iterations');
		args.push(options.iterations);			
	}		

	return {command:'./matrix/run-gif', args:args, options:{}};
}

Matrix.rain = function(options) {
	
	options = Matrix.defaultOptions('rain', options);

	var args = [];
	
	args.push('--config');
	args.push(sprintf('%dx%d', config.matrix.width, config.matrix.height));

	if (options.duration != undefined) {
		args.push('--duration');
		args.push(options.duration);			
	}		

	if (options.hue != undefined) {
		args.push('--hue');
		args.push(options.hue);			
	}		

	if (options.delay != undefined) {
		args.push('--delay');
		args.push(options.delay);			
	}		

	return {command:'./matrix/run-rain', args:args, options:{}};
}


Matrix.perlin = function(options) {
	
	options = Matrix.defaultOptions('perlin', options);

	var args = [];
	
	args.push('--config');
	args.push(sprintf('%dx%d', config.matrix.width, config.matrix.height));

	if (options.duration != undefined) {
		args.push('--duration');
		args.push(options.duration);			
	}		

	if (options.mode != undefined) {
		args.push('--mode');
		args.push(options.mode);			
	}		

	if (options.delay != undefined) {
		args.push('--delay');
		args.push(options.delay);			
	}		

	return {command:'./matrix/run-perlin', args:args, options:{}};
}

		


Matrix.Display = function() {
	
	var self = this;
	
	
	var _commands = [];

	
	self.play = function(sound, options) {
	}	
	
	self.text = function(text, options) {
	
		if (options == undefined)
			options = {};

		text = text.replace(/(\r\n|\n|\r)/gm, '\n');
		text = text.replace('\t',' ');
		
		var texts = text.split('\n');
		
		for (var i in texts) {
			var text = texts[i].trim();
			 
			if (text.length > 0) {
				_commands.push(Matrix.text(text, options));
			}
		}
	}
	
	self.rain = function(options) {
		_commands.push(Matrix.rain(options));

	}

	self.animation = function(options) {
		_commands.push(Matrix.animation(options));
	}
	
	self.image = function(image, options) {
		_commands.push(Matrix.image(image, options));
	}

	self.emoji = function(id, options) {
		this.image(sprintf('%s/%d.png', config.matrix.paths.emojis, parseInt(id)), options);			
	}
	
	self.perlin = function(options) {
		_commands.push(Matrix.perlin(options));
	}

	self.send = function(options) {

		if (options == undefined)
			options = {};


		if (typeof options.priority == 'string' && options.priority == 'low') {
			if (!_queue.empty())
				return;
		}

		_commands.forEach(function(cmd) {
			_queue.push({command:cmd.command, args:cmd.args, options:cmd.options});		
		});		
				
	}
	
}


_queue.on('idle', function() {

	
	if (util.isFunction(_idle)) {
		
		if (_queue.empty()) 
			_idle();
	}
	else {
		console.log('Nothing to do. No idle function set.');
		
	}

});


_queue.on('process', function(cmd, callback) {

	Matrix.start(cmd, callback);
});


