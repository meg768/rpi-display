
#include "matrix.h"


int main (int argc, char *argv[])
{
	Magick::InitializeMagick(*argv);

	Matrix matrix;

	string fileName = "";
	string mode = "scroll";
	int option = 0;
	double duration = 10.0;
	int scroll = true;
	int iterations = 1;
	double delay = 18.0;
	double hold = 2.0;

	int matrixHeight = matrix.height();
	int matrixWidth  = matrix.height();

	while ((option = getopt(argc, argv, "x:f:i:d:s:h:m:")) != -1) {
		switch (option) {
			case 'd':
				duration = atof(optarg);
				break;
			case 'i':
				iterations = atoi(optarg);
				break;
			case 's':
				scroll = atoi(optarg);
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
	int imageWidth   = image.columns();
	int imageHeight  = image.rows();

	if (mode == "scroll") {

		if (true) {
			Magick::Image img(Magick::Geometry(image.rows(), image.columns() + 2 * matrixWidth), "black");
			img.composite(image, matrixWidth, 0, Magick::OverCompositeOp);
			
			image = img;
		}
		int imageWidth   = image.columns();
		int imageHeight  = image.rows();
		int iterations   = 1;
		int count        = 0;
		
		int screenHeight = matrixHeight;
		int screenWidth  = matrixWidth;
		int offsetX      = -screenWidth;
		int offsetY      = -(screenHeight - imageHeight) / 2;
		
		while (offsetX < imageWidth) {
			matrix.clear();
			
			const Magick::PixelPacket *pixels = image.getConstPixels(offsetX, offsetY, screenWidth, screenHeight);
			
			matrix.drawImage(image, 0, 0, offsetX, 0);
			/*
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
			 */
			
			matrix.refresh();
			offsetX++;
/*
			if (++offsetX > imageWidth) {
				offsetX = -screenWidth;
				count++;
			}
*/
			usleep(int(delay * 1000.0));
		}
	}
	
	else if (mode == "fade") {

		for (int i = 0; i < MaxRGB; i++) {
			Magick::Image img(Magick::Geometry(image.rows(), image.columns()), "red");
			img.composite(image, 0, 0, Magick::OverCompositeOp);
			img.opacity(i);
			img.colorSpace(Magick::RGBColorspace);
			matrix.drawImage(img);
			matrix.refresh();
			usleep(50.0 * 1000.0);
		}

 
		matrix.drawImage(image);
		matrix.refresh();
		
//		if (duration > 0)
//			usleep(1000.0 * duration);

		sleep(2);
/*
		for (int i = MaxRGB; i > 0; i--) {
			image.opacity(i);

			Magick::Image img(Magick::Geometry(image.rows(), image.columns()), "red");
			img.composite(image, 0, 0, Magick::OverCompositeOp);
			matrix.drawImage(img);
			matrix.refresh();
			//usleep(4000.0 * 1000.0);
		}
*/
 /*
		printf("%d", MaxRGB);
		image.opacity(220 );

		Magick::Image img(Magick::Geometry(image.rows(), image.columns()), "black");
		img.composite(image, 0, 0, Magick::OverCompositeOp);
		image = img;

		matrix.drawImage(image);
		matrix.refresh();
*/
/*
		for (int i = 100; i > 0; i--) {
			image.opacity(i);
			usleep(delay * 1000.0);
			matrix.drawImage(image);
			matrix.refresh();
		}
	*/
	}
	/*
	else  {

		matrix.drawImage(image);
		matrix.refresh();
		
		if (duration > 0)
			sleep(duration);
		
	}
*/
	
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