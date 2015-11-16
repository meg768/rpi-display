
#include "include/matrix.h"
#include "include/timer.h"
#include "include/animation.h" 
#include "include/image-animation.h"


class ClockAnimation : public Animation {

	
public:
	ClockAnimation(Matrix *matrix) : Animation(matrix) {
	}
	
	void fileName(const char *value) {
		Magick::Image image;
		image.read(value);
		
		_image = image;
	}

	
	virtual void loop() {
		time_t t = time(0);
		struct tm *now = localtime(&t);

		int imageWidth = _image.columns();
		int imageHeight = _image.rows();
		
		int frameWidth = imageWidth / (60 + 60 + 60 + 2);
		int frameHeight = imageHeight;
		
		Magick::Image image(Magick::Geometry(frameWidth, frameHeight), "black");

		// Add background
		image.composite(_image, 0, 0, Magick::OverCompositeOp);

		// Add hour
		image.composite(_image, frameWidth * ((now->tm_hour % 12) + 1), 0, Magick::OverCompositeOp);

		// Add minute
		image.composite(_image, frameWidth * ((now->tm_hour % 12) + 60 + 1), 0, Magick::OverCompositeOp);

		_matrix->DrawImage(image);
	}
	
protected:
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
	ClockAnimation animation(&matrix);

	animation.delay(18.0);
	animation.duration(60);
	
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

