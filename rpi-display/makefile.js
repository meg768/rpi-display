

all: 
	$(MAKE) -C rpi-rgb-led-matrix 
	$(MAKE) -C rpi-rgb-led-matrix led-image-viewer
	$(MAKE) -C matrix 
