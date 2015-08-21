#ifndef _animation_h
#define _animation_h

#include "includes.h"
#include "matrix.h"


class Animation {
	
public:
	Animation(Matrix *matrix, int duration = 60) {
		srand(time(NULL));

		_matrix = matrix;
		_duration = duration;
		_startTime = time(NULL);
		_delay = 100;
	}
	
	~Animation() {
	}
	
	inline void duration(int value) {
		_duration = value;
	}
	
	inline int duration() {
		return _duration;
	}
	
	inline void delay(int value) {
		_delay = value;
	}
	
	inline int delay() {
		return _delay;
	}
	
	inline void sleep() {
		if (_delay > 0)
			usleep(10 * _delay);
	}
	
	inline Matrix *matrix() {
		return _matrix;
	}
	
	virtual int expired() {
		if (_duration > 0) {
			if (time(NULL) - _startTime > _duration) {
				return true;
			}
		}
		
		return false;
	}
	
	virtual int run() {
		_matrix->clear();
		_matrix->refresh();
		
		while (!expired()) {
			loop();
		}
		
		_matrix->clear();
		_matrix->refresh();
		
		return 0;
		
	}

	virtual void loop() {
		sleep();
	}
	

	
protected:
	Matrix *_matrix;
	time_t _startTime;
	int _duration;
	int _delay;
	
};


#endif
