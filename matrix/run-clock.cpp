
#include "include/matrix.h"
#include "include/timer.h"
#include "include/animation.h" 
#include "include/image-animation.h"


class ClockAnimation {

	void fileName(const char *value) {
		Magick::Image image;
		image.read(value);
		

		// Convert transparent PNG:s
		if (true) {
			Magick::Image tmp(Magick::Geometry(image.columns(), image.rows()), "black");
			tmp.composite(image, 0, 0, Magick::OverCompositeOp);
			
			image = tmp;
		}
		
		_image = image;
		
	}
	
	

	Magick::Image _image;

};


int main (int argc, char *argv[])
{
	static struct option options[] = {
		{"config",     1, 0, 'x'},
		{"duration",   1, 0, 'd'},
		{"delay",      1, 0, 'z'},
		{"file",       1, 0, 'f'},
		{0, 0, 0, 0}
	};
	
	Magick::InitializeMagick(*argv);
	
	Matrix matrix;

	ImageAnimation animation(&matrix);

	animation.delay(18.0);
	animation.scroll("auto");
	animation.duration(10);
	
	int option = 0, index = 0;
	
	while ((option = getopt_long_only(argc, argv, "x:f:d:", options, &index)) != -1) {
		switch (option) {
			case 'x':
				matrix.config(optarg);
				break;
			case 'd':
				animation.duration(atoi(optarg));
				break;
			case 'f':
				animation.fileName(optarg);
				break;
		}
	}

	return animation.run();

}

