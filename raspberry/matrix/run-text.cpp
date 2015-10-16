#include "matrix.h"


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
		double fontFactor  = 1.0; //(double)matrix.height() / 32.0;
		
		fontSize = fontSize * fontFactor;
		
		if (iterations == 0)
			iterations = 1;
		
		
		Magick::Image tmp(Magick::Geometry(matrixWidht, matrixHeight), "blue");
		
		printf("delayFactor %f\n", delayFactor);
		
		char fontFile[200];
		sprintf(fontFile, "./fonts/%s.ttf", fontName);
		
		tmp.font(fontFile);
		tmp.strokeColor(textColor);
		tmp.fillColor(textColor);
		tmp.fontPointsize(fontSize);
		
		Magick::TypeMetric metric;
		tmp.fontTypeMetrics(text, &metric);
		
		Magick::Image image(Magick::Geometry(metric.textWidth() + matrixWidht, matrixHeight), "green");
		image.font(fontFile);
		image.strokeColor("transparent");
		image.fillColor(textColor);
		image.fontPointsize(fontSize);
		
		//image.draw(Magick::DrawableText(matrixWidht, matrixHeight / 2.0 + metric.textHeight() / 2.0 + metric.descent(), text));
		image.draw(Magick::DrawableText(matrixWidht, matrixHeight / 2.0 - metric.textHeight() / 2.0 + metric.descent(), text));

		int imageWidth   = image.columns();
		int imageHeight  = image.rows();


		const Magick::PixelPacket *pixels = image.getConstPixels(0, 0, imageWidth, imageHeight);

		for (int count = 0; count < iterations; count++) {

			for (int offsetX = 0, offsetY = 0; offsetX < imageWidth - matrixWidht; offsetX++) {
				matrix.clear();
				//matrix.drawImage(image);

				const Magick::PixelPacket *p = pixels + offsetX;

				for (int y = 0; y < matrixHeight; y++) {
					for (int x = 0; x < matrixWidht; x++) {
						const Magick::PixelPacket *pp = p + x + (y * imageWidth);
						uint8_t red   = pp->red;
						uint8_t green = pp->green;
						uint8_t blue  = pp->blue;
						matrix.setPixel(x, y, red, green, blue);
					}
				}
				
				matrix.refresh();
				
				usleep(int(delay * 1000.0 * delayFactor*10));
				
			}
		}

	}
	catch (std::exception &error) {
		fprintf(stderr, "%s\n", error.what());
		return -1;
	}

	
    return 0;
}


