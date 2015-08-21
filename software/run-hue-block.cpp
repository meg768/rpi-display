#include "matrix.h"
#include "timer.h"


Matrix *_matrix = 0;

using namespace std;

// Simple class that generates a rotating block on the screen.
class RotatingBlockGenerator  {
public:
	RotatingBlockGenerator(Matrix *m) {
		_matrix = m;
		
	}

	
	uint8_t scale_col(int val, int lo, int hi) {
		if (val < lo) return 0;
		if (val > hi) return 255;
		return 255 * (val - lo) / (hi - lo);
	}


	void run(Timer &timer) {
		const int cent_x = _matrix->width() / 2;
		const int cent_y = _matrix->height() / 2;
		
		// The square to rotate (inner square + black frame) needs to cover the
		// whole area, even if diagnoal. Thus, when rotating, the outer pixels from
		// the previous frame are cleared.
		const int rotate_square = min(_matrix->width(), _matrix->height()) * 1.41;
		const int min_rotate = cent_x - rotate_square / 2;
		const int max_rotate = cent_x + rotate_square / 2;
		
		// The square to display is within the visible area.
		const int display_square = min(_matrix->width(), _matrix->height()) * 0.7;
		const int min_display = cent_x - display_square / 2;
		const int max_display = cent_x + display_square / 2;
		
		const float deg_to_rad = 2 * 3.14159265 / 360;
		int rotation = 0;
		while (!timer.expired()) {
			++rotation;
			//usleep(1 * 1000);
			rotation %= 360;
			for (int x = min_rotate; x < max_rotate; ++x) {
				for (int y = min_rotate; y < max_rotate; ++y) {
					float rot_x, rot_y;
					Rotate(x - cent_x, y - cent_x,
						   deg_to_rad * rotation, &rot_x, &rot_y);
					if (x >= min_display && x < max_display &&
						y >= min_display && y < max_display) { // within display square
						_matrix->setPixel(rot_x + cent_x, rot_y + cent_y,
										   scale_col(x, min_display, max_display),
										   255 - scale_col(y, min_display, max_display),
										   scale_col(y, min_display, max_display));
					} else {
						// black frame.
						_matrix->setPixel(rot_x + cent_x, rot_y + cent_y, 0, 0, 0);
					}
				}
			}
			_matrix->refresh();
			timer.sleep();
		}
	}
	
private:
	void Rotate(int x, int y, float angle,
				float *new_x, float *new_y) {
		*new_x = x * cosf(angle) - y * sinf(angle);
		*new_y = x * sinf(angle) + y * cosf(angle);
	}
	
	Matrix *_matrix;
	
};





int main (int argc, char *argv[])
{
	Magick::InitializeMagick(*argv);

	Matrix matrix;
	Timer timer;
	
	int option = 0;
	int duration = -1;
	
	while ((option = getopt(argc, argv, "x:d:")) != -1) {
		switch (option) {
			case 'd':
				timer.duration(atoi(optarg));
				break;
			case 'x':
				timer.delay(atoi(optarg));
				break;
		}
	}
	
	RotatingBlockGenerator animation(&matrix);
	animation.run(timer);

	matrix.clear();
	matrix.refresh();
	
    return 0;
}



