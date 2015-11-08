var minimist = require('minimist');



var config = {
	
	'96x96': {
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


	'32x32': {
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
	
	'phi': {
		matrix: {
			config: '96x32'
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
		console.log('Specified configuration not defined.');
		process.exit(-1);
		
	}
	
	console.log(config[args.config]);
	
	module.exports = config[args.config];
	
	
};


