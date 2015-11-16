
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

	void createImage(Magick::Image &image, int offset) {
	
		Magick::Image img(Magick::Geometry(96, 96));
		
		const Magick::PixelPacket *src = _image.getConstPixels(96 * offset, 0, 96, 96);
		const Magick::PixelPacket *dst = image.setPixels(0, 0, 96, 96);

		for (int i = 0; i < 9216; i++)
			*dst++ = *src++;

		img.syncPixels();
		
		image = img;
	}
	
	virtual void loop() {
		time_t t = time(0);
		struct tm *now = localtime(&t);

		int imageWidth = _image.columns();
		int imageHeight = _image.rows();
		
		int frameWidth = imageWidth / (60 + 60 + 60 + 2);
		int frameHeight = imageHeight;
		
		Magick::Image image(Magick::Geometry(frameWidth, frameHeight), "black");

		int bgIndex      = 0;
		int hoursIndex   = 1 + (now->tm_hour % 12);
		int minutesIndex = 1 + 60 + now->tm_min;
		int secondsIndex = 1 + 60 + 60 + 7;
		int fgIndex      = 1 + 60 + 60 + 60;

		//printf("%d %d %d %d\n", frameWidth, frameHeight, imageWidth, imageHeight);

		Magick::Image img;
		
		createImage(img, fgIndex);
		image.composite(img, 0, 0, Magick::OverCompositeOp);

		createImage(img, hoursIndex);
		image.composite(img, 0, 0, Magick::OverCompositeOp);

		createImage(img, minutesIndex);
		image.composite(img, 0, 0, Magick::OverCompositeOp);

		createImage(img, secondsIndex);
		image.composite(img, 0, 0, Magick::OverCompositeOp);

		createImage(img,fgIndex);
		image.composite(img, 0, 0, Magick::OverCompositeOp);

		
		_matrix->drawImage(image);
		_matrix->refresh();
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

