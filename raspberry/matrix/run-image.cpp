
#include "matrix.h"
#include "timer.h"

int main (int argc, char *argv[])
{
	Magick::InitializeMagick(*argv);

	Matrix matrix;

	string fileName = "";
	string mode     = "scroll";
	int iterations  = 1;
	int duration    = 10;
	double delay    = 18.0;
	double hold     = 0.0;
	
	int matrixHeight = matrix.height();
	int matrixWidth  = matrix.height();

	int option = 0;

	while ((option = getopt(argc, argv, "x:f:i:d:h:m:")) != -1) {
		switch (option) {
			case 'd':
				duration = atof(optarg);
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
			case 'h':
				hold = atof(optarg);
				break;
			case 'm':
				mode = optarg;
				break;
			case 'm':
				mode = optarg;
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
/*
	// Crop if needed
	if (true) {
		int imageWidth  = image.columns();
		int imageHeight = image.rows();

		// Make square image
		if (imageWidth != imageHeight) {
			if (imageWidth > imageHeight)
				image.crop(Magick::Geometry(imageHeight, imageHeight, (imageWidth - imageHeight) / 2, 0));
			else
				image.crop(Magick::Geometry(imageWidth, imageWidth, 0, (imageHeight - imageWidth) / 2));
		}
	}

	// Scale if needed
	if (true) {
		int imageWidth  = image.columns();
		int imageHeight = image.rows();

		if (imageWidth != matrix.width()) {
			image.sample(Magick::Geometry(matrix.width(), matrix.height()));
		}
	}
*/
	if (mode == "scroll") {

		if (true) {
			Magick::Image img(Magick::Geometry(image.columns() + 2 * matrixWidth, image.rows()), "black");
			img.composite(image, matrixWidth, 0, Magick::OverCompositeOp);
			
			image = img;
		}

		int imageWidth   = image.columns();
		int imageHeight  = image.rows();
		int matrixWidth  = matrix.width();
		int matrixHeight = matrix.height();

		for (int offsetX = 0; offsetX < imageWidth; offsetX++) {
			matrix.clear();
			
			matrix.drawImage(image, 0, 0, offsetX, 0);
			matrix.refresh();
			
			usleep(1000.0 * delay);

			if (hold > 0 && offsetX == (imageWidth - matrixWidth) / 2)
				usleep(1000.0 * 1000.0 * hold);
			
		}
	}
	
	else {

		for (int i = 0; i <= 100; i += 3) {
			matrix.setBrightness(i);
			matrix.drawImage(image);
			matrix.refresh();
		}

		matrix.setBrightness(100);
		matrix.drawImage(image);
		matrix.refresh();
		
		usleep(1000.0 * 1000.0 * (double)duration);

		for (int i = 100; i >= 0; i -= 3) {
			matrix.setBrightness(i);
			matrix.drawImage(image);
			matrix.refresh();
		}


	}
	
    return 0;
}



/*


 
 int main (int argc, char *argv[])
 {
	Magick::InitializeMagick(*argv);
 
	Matrix matrix;
 
	int option = 0;
	int duration = 10;
	int scroll = true;
	int iterations = 1;
	double rotate = 0;
	string fileName = "";
	double delay = 18.0;
	double hold = 0.0;
	
	while ((option = getopt(argc, argv, "x:f:r:i:d:s:h:")) != -1) {
 switch (option) {
 case 'd':
 duration = atoi(optarg);
 break;
 case 'i':
 iterations = atoi(optarg);
 break;
 case 's':
 scroll = atoi(optarg);
 break;
 case 'r':
 rotate = atof(optarg);
 break;
 case 'f':
 fileName = optarg;
 break;
 case 'x':
 delay = atof(optarg);
 break;
 case 'h':
 hold = atof(optarg);
 break;
 }
	}


Magick::Image image;
image.read(fileName);

// Convert transparent PNG:s
if (true) {
	Magick::Image img(Magick::Geometry(image.rows(), image.columns()), "black");
	img.composite(image, 0, 0, Magick::OverCompositeOp);
	
	image = img;
}

// Crop if needed
if (true) {
	int imageWidth  = image.columns();
	int imageHeight = image.rows();
	
	// Make square image
	if (imageWidth != imageHeight) {
		if (imageWidth > imageHeight)
			image.crop(Magick::Geometry(imageHeight, imageHeight, (imageWidth - imageHeight) / 2, 0));
			else
				image.crop(Magick::Geometry(imageWidth, imageWidth, 0, (imageHeight - imageWidth) / 2));
				}
}

// Scale if needed
if (true) {
	int imageWidth  = image.columns();
	int imageHeight = image.rows();
	
	if (imageWidth != matrix.width()) {
		image.sample(Magick::Geometry(matrix.width(), matrix.height()));
	}
}

if (!scroll) {
	
	matrix.drawImage(image);
	matrix.refresh();
	
	if (duration > 0)
		sleep(duration);
		
		}
else {
	int screenHeight = matrix.height();
	int screenWidth  = matrix.height();
	int imageWidth   = image.columns();
	int imageHeight  = image.rows();
	int offsetX      = -screenWidth;
	int offsetY      = -(screenHeight - imageHeight) / 2;
	
	
	if (imageWidth >= imageHeight) {
		image.sample(Magick::Geometry((screenWidth * imageWidth) / imageHeight, screenHeight));
		
		imageWidth   = image.columns();
		imageHeight  = image.rows();
		
		offsetX = -screenWidth;
		offsetY = -(screenHeight - imageHeight) / 2;
	}
	else {
		image.sample(Magick::Geometry(screenWidth, (screenHeight * imageHeight) / imageWidth));
		
		imageWidth   = image.columns();
		imageHeight  = image.rows();
		
		offsetX = -(screenWidth - imageWidth) / 2;
		offsetY = -screenHeight; ;
		
	}
	
	int count = 0;
	
	while (count < iterations) {
		
		
		const Magick::PixelPacket *pixels = image.getConstPixels(offsetX, offsetY, screenWidth, screenHeight);
		
		for (int row = 0; row < screenHeight; row++) {
			for (int col = 0; col < screenWidth; col++) {
				if (offsetX + col < 0 || offsetX + col >= imageWidth)
					matrix.setPixel(col, row, 0, 0, 0);
					else if (offsetY + row < 0 || offsetY + row >= imageHeight)
						matrix.setPixel(col, row, 0, 0, 0);
						else
							matrix.setPixel(col, row, pixels->red, pixels->green, pixels->blue);
							pixels++;
			}
		}
		
		matrix.refresh();
		
		if (imageWidth >= imageHeight) {
			
			if (++offsetX >= (imageWidth + screenWidth)) {
				offsetX = -screenWidth;
				count++;
			}
		}
		
		else {
			if (++offsetY >= (imageHeight + screenHeight)) {
				offsetY = -screenHeight;
				count++;
			}
		}
		usleep(delay * 1000.0);
	}
	
}

return 0;
}



*/