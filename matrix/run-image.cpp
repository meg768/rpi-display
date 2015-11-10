
#include "include/matrix.h"
#include "include/timer.h"
#include "include/animation.h" 
#include "include/image-animation.h"

int main (int argc, char *argv[])
{
	static struct option options[] = {
		{"config",     1, 0, 'x'},
		{"duration",   1, 0, 'd'},
		{"delay",      1, 0, 'z'},
		{"file",       1, 0, 'f'},
		{"scroll",     1, 0, 's'},
		{"hold",       1, 0, 'h'},
		{0, 0, 0, 0}
	};
	
	Magick::InitializeMagick(*argv);
	
	Matrix matrix;

	ImageAnimation animation(&matrix);

	animation.delay(18.0);
	animation.scroll("auto");
	animation.duration(10);
	
	int option = 0, index = 0;
	
	while ((option = getopt_long_only(argc, argv, "z:x:f:d:s:h:", options, &index)) != -1) {
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
			case 's':
				animation.scroll(optarg);
				break;
			case 'z':
				animation.delay(atof(optarg));
				break;
			case 'h':
				animation.hold(atof(optarg));
				break;
		}
	}

	return animation.run();

}

