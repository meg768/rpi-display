#include "matrix.h"


int main (int argc, char *argv[])
{
	Magick::InitializeMagick(*argv);
	
	const char *textColor  = "red";
	const char *fontName   = "Arial-Bold";

	int option       = 0;
	int iterations   = 1;
	int fontSize     = 20;
	double delay     = 18.0;

	std::string text = "ABC 123";
	
	try {
		Matrix matrix;
		
		while ((option = getopt(argc, argv, "t:i:s:c:f:x:")) != -1) {
			switch (option) {
				case 'x':
					delay = atof(optarg);
					break;
				case 'i':
					iterations = atoi(optarg);
					break;
				case 's':
					fontSize = atoi(optarg);
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

		double delayFactor = (32.0 * 32.0) / ((double)matrix.width() * (double)matrix.height());

		if (iterations == 0)
			iterations = 1;
		
		
		Magick::Image tmp(Magick::Geometry(matrix.width(), matrix.height()), "black");
		
		printf("delayFactor %f\n", delayFactor);
		
		char fontFile[200];
		sprintf(fontFile, "./fonts/%s.ttf", fontName);
		
		tmp.font(fontFile);
		tmp.strokeColor(textColor);
		tmp.fillColor(textColor);
		tmp.fontPointsize(fontSize);
		
		Magick::TypeMetric metric;
		tmp.fontTypeMetrics(text, &metric);
		
		Magick::Image image(Magick::Geometry(metric.textWidth() + 2 * matrix.width(), matrix.height()), "green");
		image.font(fontFile);
		image.strokeColor("transparent");
		image.fillColor(textColor);
		image.fontPointsize(fontSize);
		
		image.draw(Magick::DrawableText(matrix.width(), matrix.height() / 2 + metric.textHeight() / 2.0 + metric.descent(), text));

		int imageWidth   = image.columns();
		int imageHeight  = image.rows();

		if (true) {
			for (int offsetX = 0, offsetY = 0; offsetX < imageWidth; offsetX++) {
				matrix.drawImage(image, 0, 0, offsetX, offsetY);
			}
		}

		for (int count = 0; count < iterations; count++) {

			for (int offsetX = 0, offsetY = 0; offsetX < imageWidth; offsetX++) {
				matrix.clear();
				matrix.drawImage(image, 0, 0, offsetX, offsetY);
				matrix.refresh();
				
				usleep(int(delay * 1000.0 * delayFactor));
				
			}
		}

	}
	catch (std::exception &error) {
		fprintf(stderr, "%s\n", error.what());
		return -1;
	}

	
    return 0;
}


