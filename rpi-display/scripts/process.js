

var Module = module.exports = function() {

	var _process = null;

		
	this.stop = function() {
		if (_process != null) {
			var process = _process;
			
			_process = null;
	
			process.kill('SIGINT');
	
		}
		else	
			console.log('No processs to be stopped');
	}	
	
	this.start = function(command, args, options, callback) {
	
		if (callback == undefined) {
			callback = function() {
			};
		}
	
		function NO(error) {
			console.log('Failed to spawn:', command, args);
			callback();				
		}
	
		function YES() {
			callback();				
		}
	
		try {
			this.stop();
	
			console.log('Spawning: %s', command, args, options);					
	
			var spawn = require('child_process').spawn;
			var process = spawn(command, args, options);
	
			process.stderr.on('data', function (data) {
			});
	
			process.stdout.on('data', function (data) {
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
			console.log(error);
			NO(error);
		}
		
	}
	


}


