
#include "matrix.h"

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
/*
	if (fileName.length() == 0) {
		fprintf(stderr, "No image specified.\n");
		return -1;
	}
	*/
	Magick::Image image;
	image.read(fileName);

	if (!scroll) {
		int imageWidth = image.columns();
		int imageHeight = image.rows();
		
		// Make square image
		if (imageWidth != imageHeight) {
			if (imageWidth > imageHeight)
				image.crop(Magick::Geometry(imageHeight, imageHeight, (imageWidth - imageHeight) / 2, 0));
			else
				image.crop(Magick::Geometry(imageWidth, imageWidth, 0, (imageHeight - imageWidth) / 2));
			
			imageWidth  = image.rows();
			imageHeight = image.columns();
			
		}
		
		// Scale if needed
		if (imageWidth != matrix.width()) {
			image.sample(Magick::Geometry(matrix.width(), matrix.height()));
		}

		//const Magick::PixelPacket *pixels = image.getConstPixels(0, 0, 32, 32);
		
		//Magick::Image img(Magick::Geometry(image.rows(), image.columns()), "black");
		image.composite(image, 0, 0, Magick::OverCompositeOp);
		
		
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
			/*
			if (hold > 0) {
				if () {
					usleep(hold * 1000.0);
				}
			}
			 */
			usleep(delay * 1000.0);
		}
		
	}
	
    return 0;
}


