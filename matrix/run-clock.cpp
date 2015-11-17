
#include "include/matrix.h"
#include "include/timer.h"
#include "include/animation.h" 


class ClockAnimation : public Animation {

	
public:
	ClockAnimation(Matrix *matrix) : Animation(matrix) {
		_imageWidth  = 0;
		_imageHeight = 0;
		_frameWidth  = 0;
		_frameHeight = 0;
	}

	void fileName(const char *value) {
		_fileName = value;
	}

	void extractFrame(Magick::Image &image, int offset) {
		
		Magick::Image frame(Magick::Geometry(_frameWidth, _frameHeight), "transparent");
		frame.magick("RGBA");
		
		const Magick::PixelPacket *src = _image.getConstPixels(_frameWidth * offset, 0, _frameWidth, _frameHeight);
		Magick::PixelPacket *dst = frame.setPixels(0, 0, _frameWidth, _frameHeight);
		
		memcpy(dst, src, _frameWidth * _frameHeight * sizeof(Magick::PixelPacket));
		
		frame.syncPixels();
		
		image = frame;
	}
	
	virtual void init() {

		Animation::init();
		
		Magick::Image image;
		image.read(_fileName.c_str());
		
		int matrixHeight = _matrix->height();
		int imageWidth   = image.columns();
		int imageHeight  = image.rows();
		
		if (imageHeight != matrixHeight)
			image.sample(Magick::Geometry(int(double(imageWidth) * double(imageHeight) / double(matrixHeight)), matrixHeight));
		
		_image = image;
		
		_imageWidth = _image.columns();
		_imageHeight = _image.rows();
		
		_frameWidth = _imageWidth / (60 + 60 + 60 + 2);
		_frameHeight = _imageHeight;
	}
	
	virtual void loop() {
		time_t t = time(0);
		struct tm *now = localtime(&t);

		Magick::Image image(Magick::Geometry(_frameWidth, _frameHeight), "black");

		int bgIndex      = 0;
		int hoursIndex   = 1 + (((now->tm_hour % 12) * 60) + now->tm_min) / 12;
		int minutesIndex = 1 + 60 + now->tm_min;
		int secondsIndex = 1 + 60 + 60 + now->tm_sec;
		int fgIndex      = 1 + 60 + 60 + 60;

		Magick::Image frame;
		
		extractFrame(frame, bgIndex);
		image.composite(frame, 0, 0, Magick::OverCompositeOp);

		extractFrame(frame, hoursIndex);
		image.composite(frame, 0, 0, Magick::OverCompositeOp);

		extractFrame(frame, minutesIndex);
		image.composite(frame, 0, 0, Magick::OverCompositeOp);

		extractFrame(frame, secondsIndex);
		image.composite(frame, 0, 0, Magick::OverCompositeOp);

		extractFrame(frame,fgIndex);
		image.composite(frame, 0, 0, Magick::OverCompositeOp);
		
		_matrix->drawImage(image);
		_matrix->refresh();
		
		sleep();
	}
	
protected:
	Magick::Image _image;
	std::string _fileName;
	int _frameWidth, _frameHeight;
	int _imageWidth, _imageHeight;
};


int main (int argc, char *argv[])
{
	static struct option options[] = {
		{"config",     1, 0, 'x'},
		{"duration",   1, 0, 'd'},
		{"delay",      1, 0, 'z'},
		{"file",       1, 0, 'f'},
		{"pwm",        1, 0, 'w'},
		{0, 0, 0, 0}
	};
	
	Magick::InitializeMagick(*argv);
	
	Matrix matrix;
	ClockAnimation animation(&matrix);

	animation.delay(100);
	animation.duration(60);
	
	int option = 0, index = 0;
	
	while ((option = getopt_long_only(argc, argv, "x:f:d:z:w:", options, &index)) != -1) {
		switch (option) {
			case 'x':
				matrix.config(optarg);
				break;
			case 'w':
				matrix.setPWMBits(atoi(optarg));
				break;
			case 'z':
				animation.delay(atof(optarg));
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

