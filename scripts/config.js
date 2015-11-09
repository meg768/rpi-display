var minimist = require('minimist');
var sprintf  = require('./sprintf.js');


var config = module.exports = {

	timezone: 'Europe/Stockholm',
	locale: 'sv',
	
	matrix: {
		width  : 32,
		height : 32,
		
		paths: {
			fonts       : './fonts',	
			animations  : './animations/32x32',
			images      : './images',
			emojis      : './images/emojis/32x32'	
		},
		
		defaults: {
			
			text: {
				font  : 'Arial-Bold',
				size  : 18,
				color : 'blue',
				delay : 20
			},
					
			image: {
				duration : 60,
				scroll   : 'none'
			}
		}	
	}
	
};

