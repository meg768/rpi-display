#include "include/matrix.h"
#include "include/animation.h"


class Worm {
	
public:
	Worm() {
		_row     = 0;
		_column  = 0;
		_height  = 0;
		_length  = 0;
		_delay   = 0;
		_ticks   = 0;
		_hue     = -1;
	}
	
	void reset() {
		_length = int(float(_height) * 0.1 + float(_height) * 1.1 * (float(rand() % 100) / 100.0)); 
		_row    = -(rand() % (_height * 2));
		_delay  = (rand() % 10);
		_ticks  = 0;
	}
	
	void column(int value) {
		_column = value;
	}

	void height(int value) {
		_height = value;
	}
	
	void hue(int value) {
		_hue = value;
	}
	
	void draw(Matrix *matrix) {
		int hue = 120;
		int x   = _column;
		int y   = _row;

		if (_hue < 0) {
			time_t t = time(0);
			struct tm *now = localtime(&t);
			hue = ((now->tm_hour % 12) * 60 + now->tm_min) / 2;
			
		}
		else
			hue = _hue;

		matrix->setPixel(x, y--, 255, 255, 255);
		
		for (int i = 0; i < _length; i++) {
			// Calculate brightness
			int luminance  = 100 - (100 * i) / _length;

			// Add some variance
			//luminance -= (rand() % 30) + 15;

			if (luminance < 0)
				luminance = 0;

			if (luminance > 100)
				luminance = 100;
			
			HSL color;
			color.hue        = hue;
			color.saturation = 100;
			color.luminance  = luminance;

			matrix->setPixel(x, y--, color);
		}
	}
	
	void idle() {
		_ticks++;
		
		if (_ticks >= _delay) {
			_ticks = 0;
			_row++;
			
			if (_row - _length > _height)
				reset();
			
		}

	}
	
private:
	int _length, _delay, _ticks, _hue, _height;
	int _row, _column;
};

///////////////////////////////////////////////////////////////////////////////////////////////////


class MatrixAnimation : public Animation {
	
public:
	MatrixAnimation(Matrix *matrix) : Animation(matrix) {
		_hue = -1;
	}
	
	~MatrixAnimation() {
	}
	
	void hue(int value) {
		_hue = value;
	}

	virtual int run() {
		int size = _matrix->width();
		
		_worms.resize(size);
		
		for (int i = 0; i < size; i++) {
			_worms[i].hue(_hue);
			_worms[i].column(i);
			_worms[i].height(_matrix->height());
			_worms[i].reset();
		}

		return Animation::run();
	}
	
	virtual void loop() {
		_matrix->clear();
		
		for (int i = 0; i < _matrix->width(); i++) {
			_worms[i].draw(_matrix);
			_worms[i].idle();

			sleep();
		}
		
		_matrix->refresh();
		
	}

protected:
	std::vector <Worm> _worms;
	int _hue;
};

///////////////////////////////////////////////////////////////////////////////////////////////////



int main (int argc, char *argv[])
{
	static struct option options[] = {
		{"config",     1, 0, 'x'},
		{"duration",   1, 0, 'd'},
		{"delay",      1, 0, 'z'},
		{"hue",        1, 0, 'h'},
		{0, 0, 0, 0}
	};
	
	Magick::InitializeMagick(*argv);
	
	Matrix matrix;
	MatrixAnimation animation(&matrix);

	animation.duration(60);
	animation.delay(10);
	
	int option = 0, index = 0;
	
	while ((option = getopt_long_only(argc, argv, "z:d:x:h:", options, &index)) != -1) {
		switch (option) {
			case 'x':
				matrix.config(optarg);
				break;
			case 'd':
				animation.duration(atoi(optarg));
				break;
			case 'z':
				animation.delay(atof(optarg));
				break;
			case 'h':
				animation.hue(atoi(optarg));
				break;
		}
	}
	
	
	animation.run();
	
	
	return 0;
}


