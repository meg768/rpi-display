

all: 
	$(MAKE) -C hzeller
	$(MAKE) -C hzeller led-image-viewer
	$(MAKE) -C matrix 
	npm update

