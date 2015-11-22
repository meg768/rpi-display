BINARIES         = run-text run-rain run-perlin run-gif run-clock run-static run-life run-twinkle run-hue-block run-static run-image run-circle run-wash run-clock
INCLUDES         = include/*.*
CXXFLAGS         = -Wall -O3 -g

RGB_INCDIR       = ../hzeller/include
RGB_LIBDIR       = ../hzeller/lib
RGB_LIBRARY_NAME = rgbmatrix
RGB_LIBRARY      = $(RGB_LIBDIR)/lib$(RGB_LIBRARY_NAME).a

LDFLAGS  += -L$(RGB_LIBDIR) -l$(RGB_LIBRARY_NAME) -lrt -lm -lpthread
LDFLAGS  += `GraphicsMagick++-config --ldflags --libs`

CXXFLAGS += `GraphicsMagick++-config --cppflags --cxxflags`
CXXFLAGS += -I$(RGB_INCDIR)

all: $(BINARIES) 

$(BINARIES): $(INCLUDES)

clean:
	rm -f *.o $(BINARIES)

.cpp:
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

