var schedule = require('node-schedule');
var util     = require('util');
var sprintf  = require('./scripts/sprintf.js');
var random   = require('./scripts/random.js');
var matrix   = require('./scripts/matrix.js');
var extend   = require('extend');
var args     = require('minimist')(process.argv.slice(2));

// Set the time zone according to config settings
process.env.TZ = 'Europe/Stockholm';

console.log(args);
	
		
	