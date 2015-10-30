#include "include/text-animation.h"



int main (int argc, char *argv[])
{
	srand(time(NULL));
	
	Magick::InitializeMagick(*argv);
	
	Matrix matrix;
	TextAnimation animation(&matrix);
	
	int option = 0;
	
	while ((option = getopt(argc, argv, "d:x:i:f:t:c:f:s:")) != -1) {
		switch (option) {
			case 'd':
				animation.duration(atoi(optarg));
				break;
			case 'x':
				animation.delay(atof(optarg));
				break;
			case 'i':
				animation.iterations(atoi(optarg));
				break;
			case 't':
				animation.text(optarg);
				break;
			case 'c':
				animation.textColor(optarg);
				break;
			case 'f':
				animation.fontName(optarg);
				break;
			case 's':
				animation.fontSize(atof(optarg));
				break;
		}
	}
	
	return animation.run();
	
}





/*



#include "matrix.h"



#include "matrix.h"
#include "animation.h"


class ImageAnimation : public Animation {


public:
	
	ImageAnimation(Matrix *matrix) : Animation(matrix) {
		_iterations     = -1;
		_animationDelay = 1;
		
	}
	
	void iterations(int value) {
		_iterations = value;
	}

	void animationDelay(double value) {
		_animationDelay = value;
	}

	void images(std::vector<Magick::Image> &value) {
		_images = value;
	}

	
	virtual int run() {
		

		try {
			Matrix *matrix = Animation::matrix();

			int imageIndex = 0, imageCount = _images.size();
			
			// Check if we have a first image
			if (imageCount > 0) {
				// If so, get the number of animation iterations
				Magick::Image &image = _images[0];
				
				if (_iterations <= 0) {
					_iterations = image.animationIterations();
				}
			}
			
			if (_iterations <= 0)
				_iterations = 1;
			
			
			while (!expired()) {
				
				// Done iterating?!
				if (imageIndex >= imageCount) {

					// If duration not set, increase iterations
					if (_iterations > 0) {
						_iterations--;
						
						if (_iterations <= 0)
							break;
						
					}
					
					imageIndex = 0;
				}
				
				Magick::Image &image = _images[imageIndex];
				
				// Draw the image
				matrix->drawImage(image);
				
				// Get the animation delay factor
				double animationDelay = double(image.animationDelay());
				
				if (animationDelay <= 0)
					animationDelay = _animationDelay;
				
				imageIndex++;
				matrix->refresh();
				
				// Wait for next frame to display
				// (Seems like we have to reduce the delay by some factor)
				usleep(int(animationDelay * 1000.0 * delay()));
			}
			
			matrix->clear();
			matrix->refresh();
			
			
		}
		catch (std::exception &error) {
			fprintf(stderr, "Could not start animation: %s\n", error.what());
			return -1;
		}
		
		return 0;
	}
	
	
protected:
	std::vector<Magick::Image> _images;
	double _animationDelay;
	int _iterations;
};


///////////////////////////////////////////////////////////////////////////////////


class TextAnimation : public ImageAnimation {
	
public:
	TextAnimation(Matrix *matrix) : ImageAnimation(matrix) {
		
		_textColor      = "red";
		_fontName       = "./fonts/Arial-Bold.ttf";
		_fontSize       = 18;
		_iterations     = 1;
		_duration       = 0;
		_animationDelay = 1;
		_delay          = 10;
	}
	
	void fontName(const char *value) {
		_fontName = value;
	}

	void textColor(const char *value) {
		_textColor = value;
	}


	void fontSize(double value) {
		_fontSize = value;
	}

	void text(const char *value) {
		_text = value;
	}
	
	virtual int run() {

		int matrixWidth  = _matrix->width();
		int matrixHeight = _matrix->height();
		
		Magick::Image tmp(Magick::Geometry(matrixWidth, matrixHeight), "black");
		
		tmp.font(_fontName);
		tmp.strokeColor("transparent");
		tmp.fillColor(_textColor);
		tmp.fontPointsize(_fontSize);
		
		Magick::TypeMetric metric;
		tmp.fontTypeMetrics(_text, &metric);
		
		Magick::Image image(Magick::Geometry(metric.textWidth() + 2 * matrixWidth, matrixHeight), "black");
		image.font(_fontName);
		image.strokeColor("transparent");
		image.fillColor(_textColor);
		image.fontPointsize(_fontSize);
		image.draw(Magick::DrawableText(matrixWidth, matrixHeight / 2.0 + metric.textHeight() / 2.0 + metric.descent(), _text));
		
		int imageWidth   = image.columns();
		int imageHeight  = image.rows();
		
		std::vector<Magick::Image> frames;
		
		if (true) {
			const Magick::PixelPacket *pixels = image.getConstPixels(0, 0, imageWidth, imageHeight);
			
			for (int offsetX = 0, offsetY = 0; offsetX < imageWidth - matrixWidth; offsetX++) {
				
				Magick::Image frame(Magick::Geometry(matrixWidth, matrixHeight), "black");
				
				frame.modifyImage();
				
				Magick::Pixels framePixels(frame);
				Magick::PixelPacket *framePixelPacket = framePixels.get(0, 0, matrixWidth, matrixHeight);
				
				const Magick::PixelPacket *p = pixels + offsetX;
				
				for (int y = 0; y < matrixHeight; y++, p += imageWidth) {
					const Magick::PixelPacket *pp = p;
					
					for (int x = 0; x < matrixWidth; x++, pp++) {
						*framePixelPacket = *pp;
						framePixelPacket++;
					}
					
				}
				
				framePixels.sync();
				frames.push_back(frame);
				
				
			}
		}
		
		images(frames);

		return ImageAnimation::run();
	}
	
private:
	double _fontSize;
	std::string _fontName;
	std::string _textColor;
	std::string _text;
	
	
};


int main (int argc, char *argv[])
{
	srand(time(NULL));
	
	Magick::InitializeMagick(*argv);
	
	Matrix matrix;
	TextAnimation animation(&matrix);
	
	int option = 0;
	
	while ((option = getopt(argc, argv, "d:x:i:f:t:c:f:s:")) != -1) {
		switch (option) {
			case 'd':
				animation.duration(atoi(optarg));
				break;
			case 'x':
				animation.delay(atof(optarg));
				break;
			case 'i':
				animation.iterations(atoi(optarg));
				break;
			case 't':
				animation.text(optarg);
				break;
			case 'c':
				animation.textColor(optarg);
				break;
			case 'f':
				animation.fontName(optarg);
				break;
			case 's':
				animation.fontSize(atof(optarg));
				break;
		}
	}
	
	return animation.run();
	
}




*/








/*
int main (int argc, char *argv[])
{
	Magick::InitializeMagick(*argv);
	
	
	try {
		Matrix matrix;
		
		int matrixWidht  = matrix.width();
		int matrixHeight = matrix.height();

		const char *textColor  = "red";
		const char *fontName   = "./fonts/Arial-Bold.ttf";
		
		int option       = 0;
		int iterations   = 1;
		double fontSize  = 20;
		double delay     = 18.0;
		
		std::string text = "ABC 123";

		while ((option = getopt(argc, argv, "t:i:s:c:f:x:p:")) != -1) {
			switch (option) {
				case 'x':
					delay = atof(optarg);
					break;
				case 'p':
					matrix.setPWMBits(atoi(optarg));
					break;
				case 'i':
					iterations = atoi(optarg);
					break;
				case 's':
					fontSize = atof(optarg);
					break;
				case 'c':
					textColor = optarg;
					break;
				case 'f':
					fontName = optarg;
					break;
				case 't':
					text = optarg;
					break;
			}
		}
		
		if (delay < 0)
			delay = 0;
		
		if (iterations == 0)
			iterations = 1;
		
		
		Magick::Image tmp(Magick::Geometry(matrixWidht, matrixHeight), "black");
		
		tmp.font(fontName);
		tmp.strokeColor("transparent");
		tmp.fillColor(textColor);
		tmp.fontPointsize(fontSize);
		
		Magick::TypeMetric metric;
		tmp.fontTypeMetrics(text, &metric);
		
		Magick::Image image(Magick::Geometry(metric.textWidth() + 2 * matrixWidht, matrixHeight), "black");
		image.font(fontName);
		image.strokeColor("transparent");
		image.fillColor(textColor);
		image.fontPointsize(fontSize);
		image.draw(Magick::DrawableText(matrixWidht, matrixHeight / 2.0 + metric.textHeight() / 2.0 + metric.descent(), text));

		int imageWidth   = image.columns();
		int imageHeight  = image.rows();

		std::vector<Magick::Image> frames;

		if (true) {
			const Magick::PixelPacket *pixels = image.getConstPixels(0, 0, imageWidth, imageHeight);

			for (int offsetX = 0, offsetY = 0; offsetX < imageWidth - matrixWidht; offsetX++) {
				
				Magick::Image frame(Magick::Geometry(matrixWidht, matrixHeight), "black");

				frame.modifyImage();
				
				Magick::Pixels framePixels(frame);
				Magick::PixelPacket *framePixelPacket = framePixels.get(0, 0, matrixWidht, matrixHeight);
				
				const Magick::PixelPacket *p = pixels + offsetX;
				
				for (int y = 0; y < matrixHeight; y++, p += imageWidth) {
					const Magick::PixelPacket *pp = p;
					
					for (int x = 0; x < matrixWidht; x++, pp++) {
						*framePixelPacket = *pp;
						framePixelPacket++;
					}
					
				}
				
				framePixels.sync();
				frames.push_back(frame);
				
				
			}
		}
		
		if (true) {
			int count = frames.size();
			int foo = int(delay * 1000.0);
			
			for (int i = 0; i < count; i++) {
				Magick::Image &frame = frames[i];

				matrix.drawImage(frame);
				matrix.refresh();
				usleep(foo);

			}
		}
		

		
	}
	catch (std::exception &error) {
		fprintf(stderr, "%s\n", error.what());
		return -1;
	}
	
	
	return 0;
}
*/

/*

int main (int argc, char *argv[])
{
	Magick::InitializeMagick(*argv);
	
	const char *textColor  = "red";
	const char *fontName   = "Arial-Bold";

	int option       = 0;
	int iterations   = 1;
	double fontSize  = 20.0;
	double delay     = 18.0;

	std::string text = "ABC 123";
	
	try {
		Matrix matrix;

		int matrixWidht  = matrix.width();
		int matrixHeight = matrix.height();

		while ((option = getopt(argc, argv, "t:i:s:c:f:x:")) != -1) {
			switch (option) {
				case 'x':
					delay = atof(optarg);
					break;
				case 'i':
					iterations = atoi(optarg);
					break;
				case 's':
					fontSize = atof(optarg);
					break;
				case 'c':
					textColor = optarg;
					break;
				case 'f':
					fontName = optarg;
					break;
				case 't':
					text = optarg;
					break;
			}
		}
		
		if (delay < 0)
			delay = 0;

		double delayFactor = (32.0 * 32.0) / ((double)matrixWidht * (double)matrixHeight);
		double fontFactor  = 1.0 + (((double)matrixHeight - 32.0) / 32.0) * 0.2;
		
		
		fontSize = fontSize * fontFactor;
		
		if (iterations == 0)
			iterations = 1;
		
		
		Magick::Image tmp(Magick::Geometry(matrixWidht, matrixHeight), "black");
		
		printf("delayFactor %f\n", delayFactor);
		
		char fontFile[200];
		sprintf(fontFile, "./fonts/%s.ttf", fontName);
		
		tmp.font(fontFile);
		tmp.strokeColor(textColor);
		tmp.fillColor(textColor);
		tmp.fontPointsize(fontSize);
		
		Magick::TypeMetric metric;
		tmp.fontTypeMetrics(text, &metric);
		
		Magick::Image image(Magick::Geometry(metric.textWidth() + 2 * matrixWidht, matrixHeight), "black");
		image.font(fontFile);
		image.strokeColor("transparent");
		image.fillColor(textColor);
		image.fontPointsize(fontSize);
		
		image.draw(Magick::DrawableText(matrixWidht, matrixHeight / 2.0 + metric.textHeight() / 2.0 + metric.descent(), text));
		//image.draw(Magick::DrawableText(matrixWidht, matrixHeight / 2.0 - (metric.textHeight() + metric.descent()) / 2.0 + , text));

		int imageWidth   = image.columns();
		int imageHeight  = image.rows();


		const Magick::PixelPacket *pixels = image.getConstPixels(0, 0, imageWidth, imageHeight);

		for (int count = 0; count < iterations; count++) {

			for (int offsetX = 0, offsetY = 0; offsetX < imageWidth - matrixWidht; offsetX++) {

				const Magick::PixelPacket *p = pixels + offsetX;

				for (int y = 0; y < matrixHeight; y++, p += imageWidth) {
					const Magick::PixelPacket *pp = p;

					for (int x = 0; x < matrixWidht; x++, pp++) {
						matrix.setPixel(x, y, pp->red, pp->green, pp->blue);
					}
					
				}
				
				matrix.refresh();
				
				usleep(int(delay * 1000.0 * delayFactor));
				
			}
		}

	}
	catch (std::exception &error) {
		fprintf(stderr, "%s\n", error.what());
		return -1;
	}

	
    return 0;
}
*/

