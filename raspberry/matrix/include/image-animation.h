#include "animation.h"

class ImageAnimation : public Animation {
	
	
public:
	
	ImageAnimation(Matrix *matrix) : Animation(matrix) {
		_scroll = "auto";
	}
	
	void image(Magick::Image &value) {
		_image = value;
	}
	
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
	
	void scroll(const char *value) {
		_scroll = value;
	}
	
	
	void sample() {
		Matrix *matrix = Animation::matrix();
		
		int matrixWidth  = matrix->width();
		int matrixHeight = matrix->height();
		
		int imageWidth   = _image.columns();
		int imageHeight  = _image.rows();
		
		
		if (imageWidth > imageHeight) {
			_image.sample(Magick::Geometry(int(double(imageWidth) * double(imageHeight) / double(matrixHeight)), matrixHeight));
		}
		else if (imageWidth < imageHeight) {
			_image.sample(Magick::Geometry(matrixWidth, int(double(imageHeight) * double(imageWidth) / double(matrixWidth))));
		}
		else if (imageWidth != matrixWidth) {
			_image.sample(Magick::Geometry(matrixWidth, matrixHeight));
		}
		
	}
	
	
	virtual int run() {
		
		
		try {
			
			sample();
			
			
			Matrix *matrix = Animation::matrix();
			Magick::Image image = _image;
			
			int matrixWidth  = matrix->width();
			int matrixHeight = matrix->height();
			
			int imageWidth   = image.columns();
			int imageHeight  = image.rows();
			
			
			int duration = Animation::duration();
			
			
			if (_scroll != "none") {
				if (_scroll == "auto") {
					if (imageWidth > imageHeight)
						_scroll = "horizontal";
					else if (imageWidth < imageHeight)
						_scroll = "vertical";
					else
						_scroll = "horizontal";
				}
			}
			
			if (_scroll == "horizontal") {
				
				if (true) {
					Magick::Image img(Magick::Geometry(imageWidth + 2 * matrixWidth, imageHeight), "black");
					img.composite(image, matrixWidth, 0, Magick::OverCompositeOp);
					
					image = img;
				}
				
				imageWidth   = image.columns();
				imageHeight  = image.rows();
				
				for (int offsetX = 0; offsetX < imageWidth - matrixWidth; offsetX++) {
					matrix->clear();
					
					matrix->drawImage(image, 0, 0, offsetX, 0);
					matrix->refresh();
					
					sleep();
					
					//if (duration > 0 && offsetX == (imageWidth - matrixWidth) / 2)
					//	usleep(1000.0 * 1000.0 * double(duration));
					
				}
			}
			else if (_scroll == "vertical") {
				
				if (true) {
					Magick::Image img(Magick::Geometry(imageWidth, imageHeight + 2 * matrixHeight), "black");
					img.composite(image, 0, matrixHeight, Magick::OverCompositeOp);
					
					image = img;
				}
				
				imageWidth   = image.columns();
				imageHeight  = image.rows();
				
				for (int offsetY = 0; offsetY < imageHeight; offsetY++) {
					matrix->clear();
					
					matrix->drawImage(image, 0, 0, 0, offsetY);
					matrix->refresh();
					
					sleep();
					
					//if (duration > 0 && offsetY == (imageHeight - matrixHeight) / 2)
					//	usleep(1000.0 * 1000.0 * duration);
					
				}
			}
			
			else {
				
				matrix->drawImage(image);
				matrix->refresh();
				
				usleep(1000.0 * 1000.0 * (double)_duration);
				
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
	Magick::Image _image;
	std::string _scroll;
};