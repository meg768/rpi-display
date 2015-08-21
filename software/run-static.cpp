#include "matrix.h"
#include "timer.h"

int main (int argc, char *argv[])
{
	srand(time(NULL));
	Magick::InitializeMagick(*argv);

	Matrix matrix;
	Timer timer;

	int option = 0;
	
	while ((option = getopt(argc, argv, "d:x:")) != -1) {
		switch (option) {
			case 'd':
				timer.duration(atoi(optarg));
				break;
			case 'd':
				timer.delay(atoi(optarg));
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


