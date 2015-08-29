
#include "matrix.h"
#include "timer.h"

int main (int argc, char *argv[])
{
	Magick::InitializeMagick(*argv);

	Matrix matrix;

	string fileName = "";
	string scroll   = "auto";
	int iterations  = 1;
	int duration    = 0;
	double delay    = 18.0;
	
	int matrixHeight = matrix.height();
	int matrixWidth  = matrix.width();

	int option = 0;

	while ((option = getopt(argc, argv, "x:f:i:d:h:s:")) != -1) {
		switch (option) {
			case 'd':
				duration = atoi(optarg);
				break;
			case 'h':
				duration = atoi(optarg);
				break;
			case 'i':
				iterations = atoi(optarg);
				break;
			case 'f':
				fileName = optarg;
				break;
			case 'x':
				delay = atof(optarg);
				break;
			case 's':
				scroll = optarg;
				break;
		}
	}
	

	
	Magick::Image image;
	image.read(fileName);

	// Convert transparent PNG:s
	if (true) {
		Magick::Image tmp(Magick::Geometry(image.columns(), image.rows()), "black");
		tmp.composite(image, 0, 0, Magick::OverCompositeOp);
		
		image = tmp;
	}

	int imageWidth   = image.columns();
	int imageHeight  = image.rows();
	
	if (imageWidth > imageHeight) {
		image.sample(Magick::Geometry(int(double(imageWidth) * double(imageHeight) / double(matrixHeight)), matrixHeight));
	}
	else if (imageWidth < imageHeight) {
		image.sample(Magick::Geometry(matrixWidth, int(double(imageHeight) * double(imageWidth) / double(matrixWidth))));
	}
	else if (imageWidth != matrixWidth) {
		image.sample(Magick::Geometry(matrixWidth, matrixHeight));
	}

	imageWidth   = image.columns();
	imageHeight  = image.rows();

	if (scroll != "none") {
		if (scroll == "auto") {
			if (imageWidth > imageHeight)
				scroll = "horizontal";
			else if (imageWidth < imageHeight)
				scroll = "vertical";
			else
				scroll = "horizontal";
		}
	}
	
	if (scroll == "horizontal") {

		if (true) {
			Magick::Image img(Magick::Geometry(imageWidth + 2 * matrixWidth, imageHeight), "black");
			img.composite(image, matrixWidth, 0, Magick::OverCompositeOp);
			
			image = img;
		}

		imageWidth   = image.columns();
		imageHeight  = image.rows();

		for (int offsetX = 0; offsetX < imageWidth; offsetX++) {
			matrix.clear();
			
			matrix.drawImage(image, 0, 0, offsetX, 0);
			matrix.refresh();
			
			usleep(1000.0 * delay);

			if (duration > 0 && offsetX == (imageWidth - matrixWidth) / 2)
				usleep(1000.0 * 1000.0 * double(duration));
			
		}
	}
	else if (scroll == "vertical") {
		
		if (true) {
			Magick::Image img(Magick::Geometry(imageWidth, imageHeight + 2 * matrixHeight), "black");
			img.composite(image, 0, matrixHeight, Magick::OverCompositeOp);
			
			image = img;
		}
		
		imageWidth   = image.columns();
		imageHeight  = image.rows();
		
		for (int offsetY = 0; offsetY < imageHeight; offsetY++) {
			matrix.clear();
			
			matrix.drawImage(image, 0, 0, 0, offsetY);
			matrix.refresh();
			
			usleep(1000.0 * delay);
			
			if (duration > 0 && offsetY == (imageHeight - matrixHeight) / 2)
				usleep(1000.0 * 1000.0 * duration);
			
		}
	}
	
	else {
		
		// Fade in
		for (int i = 0; i <= 100; i += 3) {
			matrix.setBrightness(i);
			matrix.drawImage(image);
			matrix.refresh();
		}

		matrix.setBrightness(100);
		matrix.drawImage(image);
		matrix.refresh();
		
		usleep(1000.0 * 1000.0 * (double)duration);

		// Fade out
		for (int i = 100; i >= 0; i -= 3) {
			matrix.setBrightness(i);
			matrix.drawImage(image);
			matrix.refresh();
		}


	}
	
    return 0;
}

