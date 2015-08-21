
#include "matrix.h"
#include "animation.h"


class GifAnimation : public Animation {

public:
	
	GifAnimation(Matrix *matrix) : Animation(matrix) {
		_iterations = 1;
		_fileName   = "animations/tree.gif";
	}
	
	void iterations(int value) {
		_iterations = value;
	}
	
	void fileName(const char *fileName) {
		_fileName = fileName;
	}

	virtual int run() {
		
		try {
			
			if (_fileName.length() == 0) {
				string folder = "./animations";
				DIR *dir = opendir(folder.c_str());
				
				vector <string> files;
				
				if (dir != NULL) {
					struct dirent *entry;
					
					while ((entry = readdir(dir)) != NULL) {
						if (entry->d_name[0] != '.')
							files.push_back(entry->d_name);
					}
					
					closedir(dir);
				}
				
				if (files.size() == 0) {
					fprintf(stderr, "No animation specified.\n");
					return -1;
				}
				
				_fileName = folder + "/" + files[rand() % files.size()];
				
			}
			
			if (duration() == 0)
				return 0;
			
			std::list<Magick::Image> images;
			Magick::readImages(&images, animation.c_str());
			
			std::list<Magick::Image>::iterator iterator = images.begin();
			
			// Check if we have a first image
			if (iterator != images.end()) {
				// If so, get the number of animation iterations
				Magick::Image &image = *iterator;
				
				if (iterations == -1) {
					iterations = image.animationIterations();
				}
			}
			
			if (_iterations < 0)
				_iterations = 0;
			
			Matrix *matrix = Animation::matrix();
			
			while (!expired()) {
				
				// Done iterating?!
				if (iterator == images.end()) {
					
					// If duration set, ignore iterations
					if (iterations > 0 && duration() > 0) {
						iterations--;
						
						if (iterations == 0)
							break;
						
					}
					
					iterator = images.begin();
				}
				
				Magick::Image &image = *iterator;
				
				// Draw the image
				matrix->drawImage(image);
				
				// Get the animation delay factor
				size_t delay = image.animationDelay();
				
				iterator++;
				matrix->refresh();
				
				// Wait for next frame to display
				// (Seems like we have to reduce the delay by some factor)
				usleep(int(double((delay * 1000)) * 10));
				
			}
			
			matric->clear();
			matrix->refresh();
			
			
		}
		catch (std::exception &error) {
			fprintf(stderr, "Could not start animation: %s\n", error.what());
			return -1;
		}
		
		return 0;
	}
	

private:
	string _fileName;
	int _iterations;
};


int main (int argc, char *argv[])
{
	Magick::InitializeMagick(*argv);

	Matrix matrix;
	GifAnimation animation(&matrix);

	animation.duration(60);
	animation.delay(50);
	
	int option = 0;
	int iterations = -1;
	int verbose = 0;
	
	while ((option = getopt(argc, argv, "d:x:i:")) != -1) {
		switch (option) {
			case 'd':
				animation.duration(atoi(optarg));
				break;
			case 'x':
				animation.delay(atoi(optarg));
				break;
			case 'i':
				animation.iterations(atoi(optarg));
				break;
		}
	}
	
	string animation = optind < argc ? argv[optind] : "";
	
	animation.fileName(animation);
	
	return animation.run();

}












/*
 
#include "globals.h"

#include <dirent.h>

using namespace std;



int main (int argc, char *argv[])
{
	Magick::InitializeMagick(*argv);
	srand(time(NULL));
	
	try {
		LogiMatrix matrix;
		Timer timer;

		int option = 0;
		int iterations = -1;
		int verbose = 0;
		float speed = 5.0;
		
		while ((option = getopt(argc, argv, "s:g:i:d:v")) != -1) {
			switch (option) {
				case 'i':
					iterations = atoi(optarg);
					break;
				case 'd':
					timer.duration(atoi(optarg));
					break;
				case 'v':
					verbose = true;
					break;
				case 'g':
					matrix.setGamma(atof(optarg));
					break;
				case 's':
					speed = atof(optarg);
					break;
			}
		}
		
		string animation = optind < argc ? argv[optind] : "";
		
		if (animation.length() == 0) {
			string folder = "./animations";
			DIR *dir = opendir(folder.c_str());
			
			vector <string> files;
			
			if (dir != NULL) {
				struct dirent *entry;

				while ((entry = readdir(dir)) != NULL) {
					if (entry->d_name[0] != '.')
						files.push_back(entry->d_name);
				}
				
				closedir(dir);
			}
			
			if (files.size() == 0) {
				fprintf(stderr, "No animation specified.\n");
				return -1;
			}
			
			animation = folder + "/" + files[rand() % files.size()];
			
		}
		
		if (timer.duration() == 0)
			return 0;
		
		std::list<Magick::Image> images;
		Magick::readImages(&images, animation.c_str());
		
		std::list<Magick::Image>::iterator iterator = images.begin();
		
		// Check if we have a first image
		if (iterator != images.end()) {
			// If so, get the number of animation iterations
			Magick::Image &image = *iterator;

			if (iterations == -1) {
				iterations = image.animationIterations();
			}
		}
		
		if (iterations < 0)
			iterations = 0;
		
		while (!timer.expired()) {
			
			// Done iterating?!
			if (iterator == images.end()) {
				
				// If duration set, ignore iterations
				if (iterations > 0 && timer.duration() > 0) {
					iterations--;
					
					if (iterations == 0)
						break;
					
				}

				iterator = images.begin();
			}
			
			Magick::Image &image = *iterator;
			
			// Draw the image
			matrix.drawImage(image);
			
			// Get the animation delay factor
			size_t delay = image.animationDelay();
			
			iterator++;
			matrix.refresh();

			// Wait for next frame to display
			// (Seems like we have to reduce the delay by some factor)
			usleep(int(double((delay * 1000)) * speed));
			
		}
		
		matrix.clear();
		matrix.refresh();
		
		
	}
	catch (std::exception &error) {
		fprintf(stderr, "Could not start animation: %s\n", error.what());
		return -1;
	}
	
    return 0;
}

*/
