CXXFLAGS=-Wall -O3 -g


RGB_INCDIR=../rpi-rgb-led-matrix/include
RGB_LIBDIR=../rpi-rgb-led-matrix/lib
RGB_LIBRARY_NAME=rgbmatrix
RGB_LIBRARY=$(RGB_LIBDIR)/lib$(RGB_LIBRARY_NAME).a
LDFLAGS+=-L$(RGB_LIBDIR) -l$(RGB_LIBRARY_NAME) -lrt -lm -lpthread

# Imagemagic flags, only needed if actually compiled.
MAGICK_CXXFLAGS=`GraphicsMagick++-config --cppflags --cxxflags`
MAGICK_LDFLAGS=`GraphicsMagick++-config --ldflags --libs`

INCLUDES=matrix.h animation.h includes.h timer.h

#all: run-text run-rain run-gif

all: run-text run-rain run-perlin run-gif run-clock run-static run-life run-twinkle run-hue-block run-static run-image run-circle

run-image: run-image.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-image.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-text: run-text.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-text.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-rain: run-rain.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-rain.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-perlin: run-perlin.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-perlin.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-life: run-life.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-life.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-clock: run-clock.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-clock.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-static: run-static.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-static.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-gif: run-gif.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-gif.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-twinkle: run-twinkle.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-twinkle.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-hue-block: run-hue-block.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-hue-block.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-circle: run-circle.o $(INCLUDES)
	$(CXX) $(CXXFLAGS) run-circle.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

%.o : %.cpp
	$(CXX) -I$(RGB_INCDIR) $(CXXFLAGS) $(MAGICK_CXXFLAGS) -c -o $@ $<

%.o : %.cc
	$(CXX) -I$(RGB_INCDIR) $(CXXFLAGS) -c -o $@ $<



