#ifndef _globals_h
#define _globals_h

#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/mman.h>
#include <sys/ioctl.h>
#include <sys/time.h>
#include <string.h>
#include <fcntl.h>
#include <errno.h>
#include <signal.h>
#include <memory.h>
#include <math.h>

#include <vector>


#include <Magick++.h>



////////////////////////////////////////////////////////////////////////////////////////

class Timer {
	
public:
	Timer(int duration = 60) {
		_duration  = duration;
		_startTime = time(NULL);
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
	
private:
	time_t _startTime;
	int _duration;
};


////////////////////////////////////////////////////////////////////////////////////////


#endif
