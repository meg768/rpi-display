

all: 
	$(MAKE) -C hzeller
	$(MAKE) -C hzeller led-image-viewer
	$(MAKE) -C matrix 
	$(MAKE) -C artwork/clocks 
	npm update

