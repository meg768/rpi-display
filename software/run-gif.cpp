
#include "matrix.h"
#include "animation.h"


class GifAnimation : public Animation {

public:
	
	GifAnimation(Matrix *matrix) : Animation(matrix) {
		_iterations = -1;
		_fileName   = "";
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
				std::string folder = "./animations";
				DIR *dir = opendir(folder.c_str());
				
				std::vector <string> files;
				
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
					exit(-1);
				}
				
				int index = rand() % files.size();
				printf("Picking imae %d\n", index);
				_fileName = folder + "/" + files[index];
				
			}
			
			if (duration() == 0)
				return 0;
			
			std::list<Magick::Image> images;
			Magick::readImages(&images, _fileName.c_str());
			
			std::list<Magick::Image>::iterator iterator = images.begin();
			
			// Check if we have a first image
			if (iterator != images.end()) {
				// If so, get the number of animation iterations
				Magick::Image &image = *iterator;
				
				if (_iterations == -1) {
					_iterations = image.animationIterations();
				}
			}
			
			if (_iterations < 0)
				_iterations = 1;
			
			Matrix *matrix = Animation::matrix();
			
			while (!expired()) {
				
				// Done iterating?!
				if (iterator == images.end()) {
					
					// If duration not set, increase iterations
					if (duration() <= 0 && _iterations > 0) {
						_iterations--;
						
						if (_iterations == 0)
							break;
						
					}
					
					iterator = images.begin();
				}
				
				Magick::Image &image = *iterator;
				
				// Draw the image
				matrix->drawImage(image);
				
				// Get the animation delay factor
				size_t animationDelay = image.animationDelay();
				
				iterator++;
				matrix->refresh();
				
				// Wait for next frame to display
				// (Seems like we have to reduce the delay by some factor)
				//usleep(int(double((animationDelay * 1000)) * delay()));
				usleep(1000 *100);
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
	

private:
	string _fileName;
	int _iterations;
};


int main (int argc, char *argv[])
{
	srand(time(NULL));

	Magick::InitializeMagick(*argv);

	Matrix matrix;
	GifAnimation animation(&matrix);

	animation.duration(60);
	animation.delay(8);
	
	int option = 0;
	
	while ((option = getopt(argc, argv, "d:x:i:f:")) != -1) {
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
			case 'f':
				animation.fileName(optarg);
				break;
		}
	}
	
	return animation.run();

}











