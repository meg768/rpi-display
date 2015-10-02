#include "matrix.h"
#include "animation.h"


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
		_length = (rand() % (_height / 2)) + _height;
		_row    = -(rand() % (_height * 2));
		_delay  = (rand() % 8);
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

		int size = _matrix->width();
		
		_worms.resize(size);
		
		for (int i = 0; i < size; i++) {
			_worms[i].column(i);
			_worms[i].height(matrix->height());
			_worms[i].reset();
		}
	}
	
	~MatrixAnimation() {
	}
	
	void hue(int value) {
		for (int i = 0; i < (int)_worms.size(); i++) {
			_worms[i].hue(value);
		}
		
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
};

///////////////////////////////////////////////////////////////////////////////////////////////////



int main (int argc, char *argv[])
{
	Magick::InitializeMagick(*argv);
	
	Matrix matrix;
	MatrixAnimation animation(&matrix);

	animation.duration(60);
	animation.delay((double)(matrix.width() * matrix.height()) / 40000.0);
	
	int option;
	
	while ((option = getopt(argc, argv, "d:x:h:")) != -1) {
		switch (option) {
			case 'd':
				animation.duration(atoi(optarg));
				break;
			case 'x':
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


