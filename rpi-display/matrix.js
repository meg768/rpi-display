var util     = require('util');
var events   = require('events');
var extend   = require('extend');
var sprintf  = require('./sprintf.js');
var random   = require('./random.js');

var Queue    = require('./queue.js');
var Process  = require('./process.js');

var _process = new Process();
var _queue   = new Queue();

var Matrix = module.exports = {};


Matrix.options = {

	config: '96x96',
	
	defaults: {
		
		text: {
			font : 'Verdana',
			size : 24,
			color: 'blue'
		},
		
		
		image: {
		},
		
		perlin: {
		}
	}	
};

Matrix.defaultOptions = function(name, opts) {
	
	var options = {};
	
	if (Matrix.options != undefined && Matrix.options.defaults != undefined)
		extend(options, Matrix.options.defaults[name]);

	return extend(options, opts);
}


Matrix.text = function(text, options) {

	options = Matrix.defaultOptions('text', options);

	if (text == '')
		text = 'ABC 123';
		
	var args = [];

	args.push('--config');
	args.push(Matrix.options.config);

	args.push('--text');
	args.push(text);
	
	if (options.color != undefined) {
		args.push('--color');
		args.push(options.color);			
	}	

	if (options.font != undefined) {
		args.push('--font');
		args.push(options.font);			
	}	

	if (options.size != undefined) {
		args.push('--size');
		args.push(options.size);			
	}	

	if (options.delay != undefined) {
		args.push('--delay');
		args.push(options.delay);			
	}	
	
	return {command:'./run-text', args:args, options:{cwd:'./matrix'}};
}


Matrix.image = function(file, options) {

	options = Matrix.defaultOptions('image', options);
	
	var args = [];
	
	args.push('--config');
	args.push(Matrix.options.config);

	args.push('--file');
	args.push(file);

	if (options.delay != undefined) {
		args.push('--delay');
		args.push(options.delay);			
	}	

	return {command:'./run-image', args:args, options:{cwd:'./matrix'}};
}


Matrix.animation = function(options) {
	
	options = Matrix.defaultOptions('animation', options);

	var args = [];

	args.push('--config');
	args.push(Matrix.options.config);
	
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

	return {command:'./run-gif', args:args, options:{cwd:'./matrix'}};
}

Matrix.rain = function(options) {
	
	options = Matrix.defaultOptions('rain', options);

	var args = [];
	
	args.push('--config');
	args.push(Matrix.options.config);

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

	return {command:'./run-rain', args:args, options:{cwd:'./matrix'}};
}


Matrix.perlin = function(options) {
	
	options = Matrix.defaultOptions('perlin', options);

	var args = [];
	
	args.push('--config');
	args.push(Matrix.options.config);

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

	return {command:'./run-perlin', args:args, options:{cwd:'./matrix'}};
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
		this.image(sprintf('./images/%s/emojis/%d.png', Matrix.options.config, parseInt(id)), options);			
	}
	
	self.perlin = function(options) {
		_commands.push(Matrix.perlin(options));
	}

	self.send = function(options) {

		if (options == undefined)
			options = {};

		_commands.forEach(function(cmd) {
			_queue.push({command:cmd.command, args:cmd.args, options:cmd.options});				
		});		
				
	}
	
}


_queue.on('idle', function() {

	var now = new Date();
	
	if (_queue.empty()) {

		var cmd = undefined;

		if (now.getHours() >= 0 && now.getHours() <= 7) {
			cmd = Matrix.rain({duration: -1});
		}
		else {
			switch (random.rand(0, 15)) {
				case 0:
					cmd = Matrix.rain({duration: -1});
					break;
				case 1: 
					cmd = Matrix.perlin({duration: -1, delay: 40, mode: 3});
					break;
				default: 	
					cmd = Matrix.animation({duration: -1});
					break;
			}
			
		}

		if (cmd != undefined)			
			_process.start(cmd.command, cmd.args, cmd.options);
	}


});

_queue.on('process', function(cmd, callback) {
	_process.start(cmd.command, cmd.args, cmd.options, callback);
});


