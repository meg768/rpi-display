
DST = ../../images/clocks

all: \
	$(DST)/gold.png \
	$(DST)/black.png \
	$(DST)/red.png \
	$(DST)/swiss.png \
	$(DST)/swiss-red.png \
	$(DST)/swiss-blue.png 


$(DST)/swiss.png: swiss.psd
	python generate-clock.py -f $< -o $@
	
$(DST)/swiss-red.png: swiss-red.psd
	python generate-clock.py -f $< -o $@

$(DST)/swiss-blue.png: swiss-blue.psd
	python generate-clock.py -f $< -o $@

$(DST)/gold.png: gold.psd
	python generate-clock.py -f $< -o $@

$(DST)/black.png: black.psd
	python generate-clock.py -f $< -o $@

$(DST)/red.png: red.psd
	python generate-clock.py -f $< -o $@

