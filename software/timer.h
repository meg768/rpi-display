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
	
	void duration(int duration) {
		_duration = duration;
	}
	
	int duration() {
		return _duration;
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
			usleep(10 * _delay);
	}

private:
	time_t _startTime;
	int _duration;
	int _delay;
};


////////////////////////////////////////////////////////////////////////////////////////


#endif
