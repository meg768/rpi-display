#ifndef _timer_h
#define _timer_h


#include "includes.h"

////////////////////////////////////////////////////////////////////////////////////////

class Timer {
	
public:
	Timer(int duration = 60) {
		_duration  = duration;
		_startTime = time(NULL);
		_delay     = 10;
	}
	
	void duration(int value) {
		_duration = value;
	}
	
	int duration() {
		return _duration;
	}
	
	void delay(int value) {
		_delay = value;
	}

	int delay() {
		return _delay;
	}
	
	int expired() {
		if (_duration > 0) {
			if (time(NULL) - _startTime > _duration) {
				return true;
			}
		}
		
		return false;
	}
	
	inline void sleep() {
		if (_delay > 0)
			usleep(100 * _delay);
	}

private:
	time_t _startTime;
	int _duration;
	int _delay;
};


////////////////////////////////////////////////////////////////////////////////////////


#endif
