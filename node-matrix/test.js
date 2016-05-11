var addon = require('./build/Release/matrix');

console.log(addon.pow(4, 2));

function draw() {

	for (var x = 0; x < 32; x++)
		for (var y = 0; y < 32; y++)
			addon.setPixel(x, y, 255, 255, 255);
	
	addon.refresh();
}

addon.start();
draw();


setTimeout(function(){
	addon.stop();	
}, 10000);


