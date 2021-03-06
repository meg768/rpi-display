#include <vector>

#include "include/matrix.h"
#include "include/timer.h"


using namespace std;


uint32_t *gLevels;



class Pattern
{
public:
	
	// constructor
	Pattern (const int32_t width, const int32_t height) :
	m_width(width), m_height(height) { }
	
	// destructor
	~Pattern (void) { }
	
	// reset to first frame in animation
	virtual void init (void) = 0;
	
	// calculate next frame in the animation
	virtual bool next (void) = 0;
	
	// get width and height
	void getDimensions (int32_t &width, int32_t &height) {
		width = m_width; height = m_height;
	}
	
	uint32_t translateHue (int32_t hue);
	uint32_t translateHueValue (int32_t hue, float value);
	
protected:
	const int32_t m_width;
	const int32_t m_height;
	
private:
};



#define MAKE_COLOR(r,g,b) (((r)&0xff)<<16)+(((g)&0xff)<<8)+((b)&0xff)

//---------------------------------------------------------------------------------------------
// convert a hue from 0 to 95 to its 12-bit RGB color
//
// hue: 0 = red, 32 = blue, 64 = green
//

uint32_t Pattern::translateHue (int32_t hue)
{
	uint8_t hi, lo;
	uint8_t r, g, b;
	
	hi = hue >> 4;
	lo = ((hue & 0xf) << 4) | (hue & 0xf);
	
	switch (hi) {
		case 0: r = 0xff;    g = 0;       b = lo;      break;
		case 1: r = 0xff-lo, g = 0,       b = 0xff;    break;
		case 2: r = 0,       g = lo,      b = 0xff;    break;
		case 3: r = 0,       g = 0xff,    b = 0xff-lo; break;
		case 4: r = lo,      g = 0xff,    b = 0;       break;
		case 5: r = 0xff,    g = 0xff-lo, b = 0;       break;
	}
	
	return MAKE_COLOR (r,g,b);
}


//---------------------------------------------------------------------------------------------
// convert a hue from 0 to 95 and a brightnewss from 0 to 1.0 to its 12-bit RGB color
//
// hue: 0 = red, 32 = blue, 64 = green
// value: 0 = off, 1.0 = 100%
//

uint32_t Pattern::translateHueValue (int32_t hue, float value)
{
	uint8_t hi, lo;
	uint8_t r, g, b;
	
	hi = hue >> 4;
	lo = ((hue & 0xf) << 4) | (hue & 0xf);
	
	switch (hi) {
		case 0: r = 0xff;    g = 0;       b = lo;      break;
		case 1: r = 0xff-lo, g = 0,       b = 0xff;    break;
		case 2: r = 0,       g = lo,      b = 0xff;    break;
		case 3: r = 0,       g = 0xff,    b = 0xff-lo; break;
		case 4: r = lo,      g = 0xff,    b = 0;       break;
		case 5: r = 0xff,    g = 0xff-lo, b = 0;       break;
	}
	
	r = ((float)r + 0.5) * value;
	g = ((float)g + 0.5) * value;
	b = ((float)b + 0.5) * value;
	
	return MAKE_COLOR (r,g,b);
}



class Wash : public Pattern
{
public:
	
	// constructor
	Wash (const int32_t width, const int32_t height);
	
	// constructor
	Wash
	(
	 const int32_t width, const int32_t height,
	 const float step, const float scale, const float angle
	 );
	
	// destructor
	~Wash (void);
	
	// reset to first frame in animation
	void init (void);
	
	// calculate next frame in the animation
	bool next (void);
	
	// get / set step, controls speed of wash
	float getStep (void) {
		return m_step;
	}
	void setStep (const float step) {
		m_step = step;
	}
	
	// get / set scale, controls width of wash
	float getScale (void) {
		return m_scale;
	}
	void setScale (const float scale) {
		m_scale = scale;
	}
	
	// get / set angle
	float getAngle (void) {
		return m_angle;
	}
	void setAngle (const float angle) {
		m_angle = angle;
	}
	
private:
	
	float m_step;
	float m_scale;
	float m_angle;
	float m_state;
};




//---------------------------------------------------------------------------------------------
// constructors
//

Wash::Wash
(
 const int32_t width, const int32_t height
 ) :
Pattern (width, height),
m_step(1.0), m_scale(1.0)
{
}


Wash::Wash
(
 const int32_t width, const int32_t height,
	const float step, const float scale, const float angle
 ) :
Pattern (width, height),
m_step(step), m_scale(scale), m_angle(angle)
{
}


//---------------------------------------------------------------------------------------------
// destructor
//

Wash::~Wash (void)
{
}


//---------------------------------------------------------------------------------------------
// init -- reset to first frame in animation
//

void Wash::init (void)
{
	m_state = 0;
}


//---------------------------------------------------------------------------------------------
// next -- calculate next frame in animation
//

bool Wash::next (void)
{
	int32_t row, col, hue;
	
	float rads = m_angle*M_PI/180.0;
	for (row = 0; row < m_height; row++) {
		float x = row - ((m_width-1.0)/2.0);
		for (col = 0; col < m_width; col++) {
			float y = ((m_height-1.0)/2.0) - col;
			float xp = x * cos (rads) - y * sin (rads);
			// float yp = x * sin (rads) + y * cos (rads);
			hue = m_state + m_scale * xp + 0.5;
			while (hue < 0) hue += 96;
			while (hue >= 96) hue -= 96;
			gLevels[row * m_width + col] = translateHue (hue);
		}
	}
	
	m_state = fmod ((m_state + m_step), 96.0);
	
	return (m_state == 0);
}



int main (int argc, char *argv[])
{
	static struct option options[] = {
		{"config",     1, 0, 'x'},
		{"duration",   1, 0, 'd'},
		{"delay",      1, 0, 'z'},
		{0, 0, 0, 0}
	};
	
	Magick::InitializeMagick(*argv);

	Matrix matrix;
	Timer timer;
	
	timer.delay(18);
	
	int option = 0, index = 0;
		
	while ((option = getopt_long_only(argc, argv, "d:x:z:", options, &index)) != -1) {
		switch (option) {
			case 'd':
				timer.duration(atoi(optarg));
				break;
			case 'z':
				timer.delay(atof(optarg));
				break;
			case 'x':
				matrix.config(optarg);
				break;
		}
	}
	matrix.init();
	
	gLevels = new uint32_t[matrix.width() * matrix.height()];

	Pattern *pattern = new Wash (matrix.width(), matrix.height(), 1.0, 1.0, 0);
	pattern->init ();
	

	while (!timer.expired()) {
		matrix.fill( (uint32_t *)gLevels);
		matrix.refresh();
		timer.sleep();
		pattern->next();
	}
	
	matrix.clear();
	matrix.refresh();

	delete [] gLevels;

    return 0;
}



