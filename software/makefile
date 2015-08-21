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

all: run-text run-rain run-perlin

run-text: run-text.o 
	$(CXX) $(CXXFLAGS) $? -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-rain: run-rain.o 
	$(CXX) $(CXXFLAGS) $? -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-perlin: run-perlin.o
	$(CXX) $(CXXFLAGS) $? -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-life: run-life.o
	$(CXX) $(CXXFLAGS) $? -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-life: run-life.o
	$(CXX) $(CXXFLAGS) $? -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-clock: run-clock.o
	$(CXX) $(CXXFLAGS) $? -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-static: run-static.o
	$(CXX) $(CXXFLAGS) $? -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-gif: run-gif.o
	$(CXX) $(CXXFLAGS) $? -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

#run-text.o : run-text.cpp

%.o : %.cpp
	$(CXX) -I$(RGB_INCDIR) $(CXXFLAGS) $(MAGICK_CXXFLAGS) -c -o $@ $<

%.o : %.cc
	$(CXX) -I$(RGB_INCDIR) $(CXXFLAGS) -c -o $@ $<



