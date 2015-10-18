
#include "include/image-animation.h"


class GifAnimation : public ImageAnimation {
	
public:
	
	GifAnimation(Matrix *matrix) : ImageAnimation(matrix) {
		_iterations = -1;
		_fileName   = "";
		_duration   = 0;
	}
	
	
	void fileName(const char *fileName) {
		_fileName = fileName;
	}
	
	virtual int run() {
		
		try {
			
			if (_fileName.length() == 0) {
				
				char folder[1000];
				sprintf(folder, "./animations/%dx%d", _matrix->width(), _matrix->height());
				
				_fileName = folder;
			}
			
			if (_fileName.length() != 0) {
				
				for (;;) {
					struct stat status;
					
					if (stat(_fileName.c_str(), &status) != 0) {
						fprintf(stderr, "Cannot open file.\n");
						exit(-1);
					}
					
					if (S_ISREG(status.st_mode))
						break;
					
					else if (S_ISDIR(status.st_mode)) {
						DIR *dir = opendir(_fileName.c_str());
						
						std::vector <string> files;
						
						if (dir != NULL) {
							struct dirent *entry;
							
							while ((entry = readdir(dir)) != NULL) {
								if (entry->d_name[0] != '.')
									files.push_back(entry->d_name);
							}
							
							closedir(dir);
						}
						
						if (files.size() > 0)
							_fileName = _fileName + "/" + files[rand() % files.size()];
						else {
							fprintf(stderr, "No files in directory.\n");
							exit(-1);
						}
					}
					else {
						fprintf(stderr, "Funny file.\n");
						exit(-1);
					}
				}
				
			}
			
			
			if (_fileName.length() == 0) {
				fprintf(stderr, "No animation specified.\n");
				exit(-1);
			}
			
			std::vector<Magick::Image> frames;
			Magick::readImages(&frames, _fileName.c_str());
			
			std::vector<Magick::Image> images;
			Magick::coalesceImages(&images, frames.begin(), frames.end());
			
			ImageAnimation::images(images);
			ImageAnimation::run();
			
			
		}
		catch (std::exception &error) {
			fprintf(stderr, "Could not start animation: %s\n", error.what());
			return -1;
		}
		
		return 0;
	}
	
	
private:
	string _fileName;
};


int main (int argc, char *argv[])
{
	srand(time(NULL));
	
	Magick::InitializeMagick(*argv);
	
	Matrix matrix;
	GifAnimation animation(&matrix);
	
	animation.duration(60);
	animation.delay(10);
	
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












/*






















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

				char folder[1000];
				sprintf(folder, "./animations/%dx%d", _matrix->width(), _matrix->height());
				
				_fileName = folder;
			}

			if (_fileName.length() != 0) {
				
				for (;;) {
					struct stat status;

					if (stat(_fileName.c_str(), &status) != 0) {
						fprintf(stderr, "Cannot open file.\n");
						exit(-1);
					}
					
					if (S_ISREG(status.st_mode))
						break;
					
					else if (S_ISDIR(status.st_mode)) {
						DIR *dir = opendir(_fileName.c_str());
						
						std::vector <string> files;
						
						if (dir != NULL) {
							struct dirent *entry;
							
							while ((entry = readdir(dir)) != NULL) {
								if (entry->d_name[0] != '.')
									files.push_back(entry->d_name);
							}
							
							closedir(dir);
						}
						
						if (files.size() > 0)
							_fileName = _fileName + "/" + files[rand() % files.size()];
						else {
							fprintf(stderr, "No files in directory.\n");
							exit(-1);
						}
					}
					else {
						fprintf(stderr, "Funny file.\n");
						exit(-1);
					}
				}
			
			}
			
			
			if (_fileName.length() == 0) {
				fprintf(stderr, "No animation specified.\n");
				exit(-1);
			}
			
			std::vector<Magick::Image> frames;
			Magick::readImages(&frames, _fileName.c_str());
			
			std::vector<Magick::Image> images;
			Magick::coalesceImages(&images, frames.begin(), frames.end());
			
			int imageIndex = 0, imageCount = images.size();
			
			// Check if we have a first image
			if (imageCount > 0) {
				// If so, get the number of animation iterations
				Magick::Image &image = images[0];
				
				if (_iterations == -1) {
					_iterations = image.animationIterations();
				}
			}
			
			if (_iterations < 0)
				_iterations = 1;
			
			Matrix *matrix = Animation::matrix();
			
			while (!expired()) {
				
				// Done iterating?!
				if (imageIndex >= imageCount) {
					
					// If duration not set, increase iterations
					if (duration() <= 0 && _iterations > 0) {
						_iterations--;
						
						if (_iterations == 0)
							break;
						
					}
					
					imageIndex = 0;
				}
				
				Magick::Image &image = images[imageIndex];
				
				// Draw the image
				matrix->drawImage(image);
				
				// Get the animation delay factor
				double animationDelay = double(image.animationDelay());
				
				if (animationDelay == 0)
					animationDelay = 6;
				
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
	animation.delay(10);
	
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


*/








