var minimist = require('minimist');
var sprintf  = require('./sprintf.js');


var config = {
	
	'maxi': {
		matrix: {
			config: '96x96',
			
			paths: {
				fonts       : './fonts',	
				animations  : './animations/96x96',
				images      : './images',
				emojis      : './images/96x96/emojis'	
			},
			
			defaults: {
				
				text: {
					font  : 'Arial-Bold',
					size  : 24,
					color : 'blue'
				},
						
				image: {
					delay    : 6.0,
					duration : 60,
					scroll   : 'none'
				},
				
				perlin: {
				}
			}	
		}
	},

	'mini': {
		matrix: {
			config: '32x32',
			
			paths: {
				fonts       : './fonts',	
				animations  : './animations/32x32',
				images      : './images',
				emojis      : './images/32x32/emojis'	
			},
			
			defaults: {
				
				text: {
					font  : 'Arial-Bold',
					size  : 18,
					color : 'blue',
					delay : 26
				},
						
				image: {
					delay    : 6.0,
					duration : 60,
					scroll   : 'none'
				},
				
				perlin: {
				}
			}	
		}
	},
	
	'phi': {
		matrix: {
			config: '64x32',
			
			paths: {
				fonts       : './fonts',	
				animations  : './animations/32x32',
				images      : './images',
				emojis      : './images/32x32/emojis'	
			},
			
			defaults: {
				
				text: {
					font  : 'Arial-Bold',
					size  : 24,
					color : 'blue'
				},
						
				image: {
					delay    : 6.0,
					duration : 60,
					scroll   : 'none'
				},
				
				perlin: {
				}
			}	
		}
		
	}
	
};


function main() {
	var args = minimist(process.argv.slice(2));
	
	if (args.config == undefined) {
		console.log('No configuration speciefied. Use the --config option.');
		process.exit(-1);
	}

	if (config[args.config] == undefined) {
		console.log(sprintf('Configuration "%s" not defined.', args.config));
		process.exit(-1);
		
	}
	
	module.exports = config[args.config];
	
	
};


main();
