CXXFLAGS=-Wall -O3 -g
OBJECTS=demo-main.o minimal-example.o text-example.o led-image-viewer.o
BINARIES=run-text


RGB_INCDIR=../rpi-rgb-led-matrix/include
RGB_LIBDIR=../rpi-rgb-led-matrix/lib
RGB_LIBRARY_NAME=rgbmatrix
RGB_LIBRARY=$(RGB_LIBDIR)/lib$(RGB_LIBRARY_NAME).a
LDFLAGS+=-L$(RGB_LIBDIR) -l$(RGB_LIBRARY_NAME) -lrt -lm -lpthread

# Imagemagic flags, only needed if actually compiled.
MAGICK_CXXFLAGS=`GraphicsMagick++-config --cppflags --cxxflags`
MAGICK_LDFLAGS=`GraphicsMagick++-config --ldflags --libs`

all: run-text run-rain

allX: run-text run-rain run-perlin run-gif run-clock run-static run-life

run-text: run-text.o 
	$(CXX) $(CXXFLAGS) $? -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-rain: run-rain.o matrix.h animation.h
	$(CXX) $(CXXFLAGS) run-rain.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-perlin: run-perlin.o
	$(CXX) $(CXXFLAGS) run-perlin.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-life: run-life.o
	$(CXX) $(CXXFLAGS) run-life.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-clock: run-clock.o
	$(CXX) $(CXXFLAGS) run-clock.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-static: run-static.o
	$(CXX) $(CXXFLAGS) run-static.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-gif: run-gif.o
	$(CXX) $(CXXFLAGS) run-gif.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)


%.o : %.cpp
	$(CXX) -I$(RGB_INCDIR) $(CXXFLAGS) $(MAGICK_CXXFLAGS) -c -o $@ $<

%.o : %.cc
	$(CXX) -I$(RGB_INCDIR) $(CXXFLAGS) -c -o $@ $<



