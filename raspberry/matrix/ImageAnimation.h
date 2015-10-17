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
