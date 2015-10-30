var util     = require('util');
var events   = require('events');

var Module = module.exports = function() {
	var sprintf  = require('./sprintf.js');
	var random   = require('./random.js');
	
	var Queue    = require('./runqueue.js');

	var _process = null;
	var _queue   = new Queue();
	var _this    = this;
			
	_queue.on('idle', function() {
	
	
		console.log('Idle...');
		_this.emit('idle');
	
	});
	
	_queue.on('process', function(item, callback) {
		startProcess(item.command, item.args, item.options, callback);
	});
	
	
	
	function stopProcess() {
		if (_process != null) {
			var process = _process;
			
			_process = null;
	
			process.kill('SIGINT');
	
		}
	}	
	
	function startProcess(command, args, options, callback) {
	
		try {
			stopProcess();
			
			if (callback == undefined) {
				callback = function() {
				};
			}
	
			function NO(error) {
				console.log("Failed to spawn...", error == undefined ? '' : error);
				callback();				
			}
	
			function YES() {
				callback();				
			}
	
			console.log('Spawning: %s', command, args, options);					
	
			var spawn = require('child_process').spawn;
			var process = spawn(command, args, options);
	
			process.stderr.on('data', function (data) {
				console.log('stderr: ' + data);
			});
	
			process.stdout.on('data', function (data) {
				console.log('stdout: ' + data);
			});
			
			if (process == null) {
				NO();
			}
			else {
				process.on('error', function() {
					NO();
				});
	
				process.on('close', function() {
					YES();
				});		
			}
			
			return _process = process;
		}
		catch (error) {
			NO(error);
		}
		
	}
	
	
	function spawn(commands) {
	
		if (!util.isArray(commands))
			commands = [commands];
			
		var idle = _queue.empty();
		
		commands.forEach(function(cmd) {
			if (typeof cmd.priority == 'string' && cmd.priority == 'low') {
				if (idle)	
					_queue.push(cmd);
			}
			else 
				_queue.push(cmd);				
		});		
	}
	

	_this.sendRaw = function(commands) {
		if (commands.length > 0)
			spawn(commands);	
	};
	
	_this.send = function(messages) {
	
		if (!util.isArray(messages))
			messages = [messages];
	
		var commands = [];
		
		messages.forEach(function(msg) {
	
			if (msg.type == 'text') {
				var command = './run-text';
				var args    = [];
				var options = {cwd: 'matrix'};
		
	
				if (typeof msg.text == 'string') {
					args.push('-t');
					args.push(msg.text);
				}
	
				if (typeof msg.color == 'string') {
	
					if (msg.color == 'random') {
						msg.color = sprintf('hsl(%d,%d%%,%d%%)', random.rand(0, 360), 100, 50);
					}		
	
					args.push('-c');
					args.push(msg.color);			
				}
	
				if (typeof msg.font == 'string') {
					args.push('-f');
					args.push(sprintf('./fonts/%s.ttf', msg.font));			
				}
	
				if (msg.size != undefined) {
					args.push('-s');
					args.push(msg.size);			
				}
	
				if (msg.delay != undefined) {
					args.push('-x');
					args.push(msg.delay);			
				}
				
				commands.push({command:command, args:args, options:options, priority:msg.priority});
								
			}
	
			if (msg.type == 'image') {
				var command = './run-image';
				var args    = [];
				var options = {cwd: 'matrix'};
		
	
				if (msg.image != undefined) {
					args.push('-f');
					args.push(msg.image);
				}
				
				if (msg.hold != undefined) {
					args.push('-h');
					args.push(msg.hold);
				}
	
				if (msg.delay != undefined) {
					args.push('-x');
					args.push(msg.delay);			
				}
				
				commands.push({command:command, args:args, options:options, priority:msg.priority});
								
			}
	
			if (msg.type == 'emoji') {
				var command = './run-image';
				var args    = [];
				var options = {cwd: 'matrix'};
		
	
				if (msg.id != undefined) {
					args.push('-f');
					args.push('./images/emojis/' + parseInt(msg.id) + '.png');
				}
				
				if (msg.hold != undefined) {
					args.push('-h');
					args.push(msg.hold);
				}
	
				if (msg.delay != undefined) {
					args.push('-x');
					args.push(msg.delay);			
				}
				
				commands.push({command:command, args:args, options:options, priority:msg.priority});
								
			}
	
			
		});
		
		if (commands.length > 0)
			spawn(commands);
	}
	
	util.inherits(_this, events.EventEmitter);

		
};


util.inherits(Module, events.EventEmitter);


