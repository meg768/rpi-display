var util     = require('util');
var events   = require('events');
var extend   = require('extend');
var config   = require('./config.js');
var sprintf  = require('./sprintf.js');
var random   = require('./random.js');

var Queue    = require('./queue.js');
var Process  = require('./process.js');

var _process = new Process();
var _queue   = new Queue();



var Matrix = {};


_commands['text'] = function() {
	
}
		
_queue.on('idle', function() {

	var now = new Date();
	
	if (_queue.empty()) {
		var msg = {};

		if (now.getHours() >= 0 && now.getHours() <= 7) {
			msg = {type: 'rain', duration: -1};
		}
		else {
			switch (random.rand(0, 15)) {
				case 0:
					msg = {type: 'rain', duration: -1};
					break;
				case 1: 
					msg = {type: 'perlin', duration: -1, delay: 40, mode: 3};
					break;
				default: 	
					msg = {type: 'gif', duration: -1};
					break;
			}
			
		}

		var cmd = translateMessage(msg);
		
		if (cmd != undefined)			
			_process.start(cmd.command, cmd.args, cmd.options);
	}


});

_queue.on('process', function(item, callback) {
	_process.start(item.command, item.args, item.options, callback);
});


function translateMessage(message) {

	var params  = {};
	var command = undefined;
	var args    = [];
	var options = {cwd: 'matrix'};	
	var msg     = {};
		
	extend(msg, config.defaults['*']);
	
	if (config.defaults[message.type] != undefined)
		extend(msg, config.defaults[message.type]);
	
	extend(msg, message);


	if (msg.config != undefined) {
		params['--config'] = msg.config;
	}

	if (msg.delay != undefined) {
		params['--delay'] = msg.delay;
	}

	if (msg.iterations != undefined) {
		params['--iterations'] = msg.iterations;
	}

	if (msg.duration != undefined) {
		params['--duration'] = msg.duration;
	}

	if (msg.file != undefined) {
		params['--file'] = msg.file;
	}

	if (msg.hue != undefined) {
		params['--hue'] = msg.hue;
	}

	if (msg.text != undefined) {
		params['--text'] = msg.text;
	}

	if (msg.color != undefined) {
		params['--color'] = msg.color;
	}

	if (msg.size != undefined) {
		params['--size'] = msg.size;
	}


	if (msg.mode != undefined) {
		params['--mode'] = msg.mode;
	}
	
	//////////////////

	if (msg.type == 'text') {
		command = './run-text';

		if (msg.font != undefined) {
			params['--font'] = sprintf('./fonts/%s.ttf', msg.font);
		}
	

	}

	if (msg.type == 'rain') {
		command = './run-rain';

	}
	
	if (msg.type == 'gif') {
		command = './run-gif';
		
		

	}

	if (msg.type == 'perlin') {
		command = './run-perlin';
		
	}

	if (msg.type == 'emoji') {
		command = './run-image';
		
		if (msg.id != undefined)
			params['--file'] = sprintf('./images/%s/emojis/%d.png', msg.config, msg.id);
	}

	if (msg.type == 'image') {
		command = './run-image';

		if (msg.image != undefined) {
			params['--file'] = msg.image;
		}
		
	}

	if (command == undefined)
		return undefined;

			
	for (var key in params) {
		args.push(key);
		args.push(params[key]);
	}
	

	return {command:command, args:args, options:options};
}

function spawn(commands) {

	console.log('***************spawning', commands);
	
	if (!util.isArray(commands))
		commands = [commands];
		
	var idle = _queue.empty();
	
	commands.forEach(function(cmd) {
		var priority = cmd.priority;
		
		if (typeof priority != 'string')
			priority = 'normal';
			
		if (priority == 'low') {
			if (idle)	
				_queue.push(cmd);
		}
		else 
			_queue.push(cmd);				
	});		
}


function send(messages) {

	if (!util.isArray(messages))
		messages = [messages];

	var commands = [];
	
	messages.forEach(function(msg) {

		var command = translateMessage(msg);
		
		if (command != undefined)
			commands.push(command);
/*
		if (msg.type == 'text') {
			var command = './run-text';
			var args    = [];
			var options = {cwd: 'matrix'};

			args.push('--config');
			args.push('96x96');


			if (typeof msg.text == 'string') {
				args.push('--text');
				args.push(msg.text);
			}

			if (typeof msg.color == 'string') {

				if (msg.color == 'random') {
					msg.color = sprintf('hsl(%d,%d%%,%d%%)', random.rand(0, 360), 100, 50);
				}		

				args.push('--color');
				args.push(msg.color);			
			}

			if (typeof msg.font == 'string') {
				args.push('--font');
				args.push(sprintf('./fonts/%s.ttf', msg.font));			
			}

			if (msg.size != undefined) {
				args.push('--size');
				args.push(msg.size);			
			}

			if (msg.delay != undefined) {
				args.push('--delay');
				args.push(msg.delay);			
			}
			
			commands.push({command:command, args:args, options:options, priority:msg.priority});
							
		}

		if (msg.type == 'image') {
			var command = './run-image';
			var args    = [];
			var options = {cwd: 'matrix'};

			args.push('--config');
			args.push('96x96');
	

			if (msg.image != undefined) {
				args.push('--file');
				args.push(msg.image);
			}
			
			if (msg.hold != undefined) {
				args.push('--hold');
				args.push(msg.hold);
			}

			if (msg.delay != undefined) {
				args.push('--delay');
				args.push(msg.delay);			
			}
			
			commands.push({command:command, args:args, options:options, priority:msg.priority});
							
		}

		if (msg.type == 'emoji') {
			var command = './run-image';
			var args    = [];
			var options = {cwd: 'matrix'};
	
			args.push('--config');
			args.push('96x96');

			if (msg.id != undefined) {
				args.push('--file');
				args.push('./images/emojis/' + parseInt(msg.id) + '.png');
			}
			
			if (msg.hold != undefined) {
				args.push('--hold');
				args.push(msg.hold);
			}

			if (msg.delay != undefined) {
				args.push('--delay');
				args.push(msg.delay);			
			}
			
			commands.push({command:command, args:args, options:options, priority:msg.priority});
							
		}
*/
		
	});
	
	if (commands.length > 0)
		spawn(commands);
}


Matrix.Display = function() {
	
	var self = this;
	
	
	var _messages = [];
	
	
	
	self.play = function(sound, options) {
		
		var msg = {};
		
		msg.type  = 'audio';
		msg.sound = sound;

		_messages.push(msg);
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
				var msg = {};
				extend(msg, options, {type:'text', text:text});
				
				_messages.push(msg);
			}
		}
	}
	
	self.image = function(image, options) {

		if (options == undefined)
			options = {};
			
		var msg = {};
		extend(msg, options, {type:'image', image:image});

		_messages.push(msg);	
	}

	self.emoji = function(id, options) {
		if (options == undefined)
			options = {};
			
		var msg = {};
		extend(msg, options, {type:'emoji', id:id});

		_messages.push(msg);	
	}
	

	self.send = function(options) {

		if (options == undefined)
			options = {};
			
		if (_messages.length > 0) {
		
			if (typeof options.priority == 'string') {
				_messages.forEach(function(msg) {
					msg.priority = options.priority;
				});
			}
			send(_messages);
			_messages = [];
		}
		
				
	}
	
}


module.exports = Matrix;
