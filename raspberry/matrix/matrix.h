#ifndef _matrix_h
#define _matrix_h


#include "includes.h"

typedef struct {
	uint8_t red;     // 0 - 255 */
	uint8_t green;   // 0 - 255 */
	uint8_t blue;    // 0 - 255 */
} RGB;

typedef struct {
	uint16_t hue;       // 0 - 360  */
	uint8_t saturation; // 0 - 100  */
	uint8_t luminance;  // 0 - 100  */
} HSL;


static void *__matrix = 0;


class Matrix {

	public:
	
	Matrix() {
		
		__matrix = this;
		
		// Trap ctrl-c to call quit function
		signal(SIGINT, Matrix::quit);
		signal(SIGKILL, Matrix::quit);
		
		io = new rgb_matrix::GPIO();
		
		if (!io->Init()) {
			exit(-1);
		}
		
		matrix = new rgb_matrix::RGBMatrix(io, 32, 1, 1);
		canvas = matrix->CreateFrameCanvas();
	}

	virtual ~Matrix() {
		delete matrix;
		delete io;
	}
	
	static void quit(int sig)
	{
		Matrix *matrix = (Matrix *)__matrix;
		
		matrix->clear();
		matrix->refresh();
		
		exit(-1);
	}
		
	int width() {
		return canvas->width();
	}
	
	int height() {
		return canvas->height();
	}

	void clear() {
		canvas->Clear();
	}
	
	void fill(uint32_t *buffer) {
		
		uint32_t *p = buffer;

		int width  = canvas->width();
		int height = canvas->height();
		
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++) {
				uint32_t color = *p++;
				int blue  = color & 0xFF;
				int green = (color >> 8) & 0xFF;
				int red   = (color >> 16) & 0xFF;
				setPixel(x, y, red, green, blue);
			}
		}
	}
	

	void setBrightness(int value) {
		canvas->SetBrightness(value);
	}
	
	void setPixel(int x, int y, int r, int g, int b) {
		canvas->SetPixel(x, y, r, g, b);
	}


	inline void setPixel(int x, int y, RGB color) {

		setPixel(x, y, color.red, color.green, color.blue);	
	}

	inline void setPixel(int x, int y, HSL color) {
		
		uint8_t red, green, blue;			
		HslToRgb((double)color.hue, (double)color.saturation / 100.0, (double)color.luminance / 100.0, red, green, blue);
		
		setPixel(x, y, red, green, blue);
	}
	void HslToRgb(double h, double s, double v, uint8_t &red, uint8_t &green, uint8_t &blue)
	{
		double hh = 0, p = 0, q = 0, t = 0, ff = 0;
		double r = 0, g = 0, b = 0;
		long i = 0;
		
		if (s <= 0.0) {
			r = v, g = v, b = v;
		}
		else {
			hh = h;
			
			while (hh < 0)
				hh += 360.0;
			
			while (hh >= 360.0)
				hh -= 360.0;
			
			hh = hh / 60.0;
			i  = (long)hh;
			ff = hh - i;
			
			p = v * (1.0 - s);
			q = v * (1.0 - (s * ff));
			t = v * (1.0 - (s * (1.0 - ff)));
			
			switch(i) {
				case 0:
					r = v, g = t, b = p;
					break;
				case 1:
					r = q, g = v, b = p;
					break;
				case 2:
					r = p, g = v, b = t;
					break;
					
				case 3:
					r = p, g = q, b = v;
					break;
				case 4:
					r = t, g = p, b = v;
					break;
				default:
					r = v, g = p, b = q;
					break;
			}
			
		}
		
		red   = (uint8_t)(r * 255.0);
		green = (uint8_t)(g * 255.0);
		blue  = (uint8_t)(b * 255.0);
	}

	void drawImage(Magick::Image &image, int x, int y, int offsetX, int offsetY) {
		
		int screenWidth  = width();
		int screenHeight = height();
		
		int width        = screenWidth - x;
		int height       = screenHeight - y;
		
		const Magick::PixelPacket *pixels = image.getConstPixels(offsetX, offsetY, width, height);
		
		for (int row = y; row < height; row++) {
			for (int col = x; col < width; col++) {
				uint8_t red   = pixels->red;
				uint8_t green = pixels->green;
				uint8_t blue  = pixels->blue;
				setPixel(col, row, red, green, blue);
				pixels++;
			}
		}
	}
	
	void drawImage(Magick::Image &image) {
		drawImage(image, 0, 0, 0, 0);
	}
	
	void refresh() {
		canvas = matrix->SwapOnVSync(canvas);
	}
	
	
private:
	rgb_matrix::RGBMatrix *matrix;
	rgb_matrix::GPIO *io;
	rgb_matrix::FrameCanvas *canvas;
};


#endif
