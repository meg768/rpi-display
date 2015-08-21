CXXFLAGS=-Wall -O3 -g
OBJECTS=demo-main.o minimal-example.o text-example.o led-image-viewer.o
BINARIES=run-text


# Where our library resides. It is split between includes and the binary
# library in lib
RGB_INCDIR=../rpi-rgb-led-matrix/include
RGB_LIBDIR=../rpi-rgb-led-matrix/lib
RGB_LIBRARY_NAME=rgbmatrix
RGB_LIBRARY=$(RGB_LIBDIR)/lib$(RGB_LIBRARY_NAME).a
LDFLAGS+=-L$(RGB_LIBDIR) -l$(RGB_LIBRARY_NAME) -lrt -lm -lpthread

# Imagemagic flags, only needed if actually compiled.
MAGICK_CXXFLAGS=`GraphicsMagick++-config --cppflags --cxxflags`
MAGICK_LDFLAGS=`GraphicsMagick++-config --ldflags --libs`

run-text: run-text.o $(RGB_LIBRARY)
	$(CXX) $(CXXFLAGS) run-text.o -o $@ $(LDFLAGS) $(MAGICK_LDFLAGS)

run-text.o : run-text.cpp
	$(CXX) -I$(RGB_INCDIR) $(CXXFLAGS) $(MAGICK_CXXFLAGS) -c -o $@ $<

%.o : %.cc
	$(CXX) -I$(RGB_INCDIR) $(CXXFLAGS) -c -o $@ $<



