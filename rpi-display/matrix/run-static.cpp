#include "include/matrix.h"
#include "include/timer.h"

int main (int argc, char *argv[])
{
	static struct option options[] = {
		{"config",     1, 0, 'x'},
		{"duration",   1, 0, 'd'},
		{"delay",      1, 0, 'z'},
		{0, 0, 0, 0}
	};
	
	Magick::InitializeMagick(*argv);

	Matrix matrix;
	Timer timer;
	
	timer.delay(2.0);

	int option = 0, index = 0;
	
	while ((option = getopt_long_only(argc, argv, "d:x:z:", options, &index)) != -1) {
		switch (option) {
			case 'd':
				timer.duration(atoi(optarg));
				break;
			case 'z':
				timer.delay(atof(optarg));
				break;
			case 'x':
				matrix.config(optarg);
				break;
		}
	}


	while (!timer.expired()) {

		int width = matrix.width();
		int height = matrix.height();

		
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++) {
				int value = (rand() % 2) * 128;
				
				matrix.setPixel(x, y, value, value, value);
			}
		}

		matrix.refresh();
		timer.sleep();
	}
	
	matrix.clear();
	matrix.refresh();
	
    return 0;
}


