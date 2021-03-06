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
	
	inline void delay(double value) {
		_delay = value;
	}
	
	inline double delay() {
		return _delay;
	}
	
	inline void sleep() {
		if (_delay > 0)
			usleep(int(1000.0 * _delay));
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
	
	virtual void init() {
		_matrix->init();
		_matrix->clear();
		_matrix->refresh();
	}
	
	virtual void cleanup() {
		_matrix->clear();
		_matrix->refresh();
	}
	
	virtual int run() {

		init();
		
		while (!expired()) {
			loop();
		}
	
		cleanup();
		
		return 0;
		
	}

	virtual void loop() {
		sleep();
	}
	

	
protected:
	Matrix *_matrix;
	time_t _startTime;
	int _duration;
	double _delay;
	
};


#endif
