BINARIES         = run-text run-rain run-perlin run-gif run-clock run-static run-life run-twinkle run-hue-block run-static run-image run-circle run-wash run-clock
INCLUDES         = include/*.*
CXXFLAGS         = -Wall -O3 -g

RGB_INCDIR       = ../rpi-rgb-led-matrix/include
RGB_LIBDIR       = ../rpi-rgb-led-matrix/lib
RGB_LIBRARY_NAME = rgbmatrix
RGB_LIBRARY      = $(RGB_LIBDIR)/lib$(RGB_LIBRARY_NAME).a

LDFLAGS  += -L$(RGB_LIBDIR) -l$(RGB_LIBRARY_NAME) -lrt -lm -lpthread
LDFLAGS  += `GraphicsMagick++-config --ldflags --libs`

CXXFLAGS += `GraphicsMagick++-config --cppflags --cxxflags`
CXXFLAGS += -I$(RGB_INCDIR)

all: $(BINARIES) 

clean:
	rm -f *.o $(BINARIES)
	
run-image: run-image.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-text: run-text.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-rain: run-rain.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-perlin: run-perlin.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-life: run-life.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-clock: run-clock.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-static: run-static.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-gif: run-gif.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-twinkle: run-twinkle.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-hue-block: run-hue-block.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-circle: run-circle.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 

run-wash: run-wash.cpp $(INCLUDES)
	$(CXX) $(CXXFLAGS) $< -o $@ $(LDFLAGS) 


%.o : %.cpp
	$(CXX) $(CXXFLAGS) -c -o $@ $<

%.o : %.cc
	$(CXX) $(CXXFLAGS) -c -o $@ $<
