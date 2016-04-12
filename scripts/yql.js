var request = require('request');

var YQL = module.exports = function() {

	var _this = this;
	
	_this.request = function(query, callback) {
		var options = {};
		
		options.format   = 'json';
		options.env      = 'store://datatables.org/alltableswithkeys';
		options.callback = '';
		options.q        = query;
		
		var params = '';
		
		for (var key in options) {
			if (params != '')
				params += '&';
				
			params += key + '=' + encodeURIComponent(options[key]);
		}	
	
		var url = 'https://query.yahooapis.com/v1/public/yql?' + params;
	
		console.log(url);
		
		request(url, function (error, response, body) {
			try {
				if (error)
					throw error;
	
				if (response.statusCode == 200) {
					callback(JSON.parse(body));
				}
				else {
					throw new Error('Invalid status code');
				}
			}
			catch(error) {
				console.log(error);
				callback();
			}
			
		});
		
	};	
};
