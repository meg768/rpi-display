var minimist = require('minimist');
var sprintf  = require('./sprintf.js');


var config = module.exports = {

	matrix: {
		width  : 32,
		height : 32,
		config : '32x32',
		
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
			}
		}	
	}
	
};

