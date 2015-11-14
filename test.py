#!/usr/bin/python
# coding=utf-8


import sys, getopt, logging, datetime

from PIL import Image
import time


class Clock:

	matrixWidth  = 96
	matrixHeight = 96

	clock = Image.open("./images/clock/clock1.png")
	image = Image.new("RGBA", (matrixWidth, matrixHeight))

	def createImage():
		
		time = datetime.datetime.now()
	
		backgroundImage = clock.crop((matrixWidth * 0, 0, matrixWidth * 0 + matrixWidth, matrixHeight))
		foregroundImage = clock.crop((matrixWidth * 1, 0, matrixWidth * 1 + matrixWidth, matrixHeight))
		hoursImage	  = clock.crop((matrixWidth * 2, 0, matrixWidth * 2 + matrixWidth, matrixHeight))
		minutesImage	  = clock.crop((matrixWidth * 3, 0, matrixWidth * 3 + matrixWidth, matrixHeight))
		secondsImage	  = clock.crop((matrixWidth * 4, 0, matrixWidth * 4 + matrixWidth, matrixHeight))
	
		# Rotate clock 
		secondsImage = secondsImage.rotate(-360.0 * (time.second / 60.0), Image.BICUBIC)
		hoursImage = hoursImage.rotate(-360.0 * ((time.hour % 12) * 60 + time.minute) / (12.0 * 60.0), Image.BICUBIC)
		minutesImage = minutesImage.rotate(-360.0 * (time.minute / 60.0), Image.BICUBIC)
	
		matrixImage = Image.new("RGBA", (matrixWidth, matrixHeight)) 
		matrixImage.paste(backgroundImage, [0, 0, 96, 96], backgroundImage)
		matrixImage.paste(hoursImage, [0, 0, 96, 96], hoursImage)
		matrixImage.paste(minutesImage, [0, 0, 96, 96], minutesImage)
		matrixImage.paste(secondsImage, [0, 0, 96, 96], secondsImage)
		matrixImage.paste(foregroundImage, [0, 0, 96, 96], foregroundImage)

		image = matrixImage

	def displayImage(canvas):
		for y in range(0, 96):
			for x in range(0, 96):
				rgb = image.getpixel((x, y))
				canvas.SetPixel(x, y, rgb[0], rgb[1], rgb[2])



def renderClockImage():
	matrixWidth  = 96
	matrixHeight = 96
	
	time = datetime.datetime.now()

	clock = Image.open("./images/clock/clock1.png")

	backgroundImage = clock.crop((matrixWidth * 0, 0, matrixWidth * 0 + matrixWidth, matrixHeight))
	foregroundImage = clock.crop((matrixWidth * 1, 0, matrixWidth * 1 + matrixWidth, matrixHeight))
	hoursImage		 = clock.crop((matrixWidth * 2, 0, matrixWidth * 2 + matrixWidth, matrixHeight))
	minutesImage	 = clock.crop((matrixWidth * 3, 0, matrixWidth * 3 + matrixWidth, matrixHeight))
	secondsImage	 = clock.crop((matrixWidth * 4, 0, matrixWidth * 4 + matrixWidth, matrixHeight))

	# Rotate clock 
	secondsImage = secondsImage.rotate(-360.0 * (time.second / 60.0), Image.BICUBIC)
	hoursImage = hoursImage.rotate(-360.0 * ((time.hour % 12) * 60 + time.minute) / (12.0 * 60.0), Image.BICUBIC)
	minutesImage = minutesImage.rotate(-360.0 * (time.minute / 60.0), Image.BICUBIC)

	matrixImage = Image.new("RGBA", (matrixWidth, matrixHeight)) 
	matrixImage.paste(backgroundImage, [0, 0, 96, 96], backgroundImage)
	matrixImage.paste(hoursImage, [0, 0, 96, 96], hoursImage)
	matrixImage.paste(minutesImage, [0, 0, 96, 96], minutesImage)
	matrixImage.paste(secondsImage, [0, 0, 96, 96], secondsImage)
	matrixImage.paste(foregroundImage, [0, 0, 96, 96], foregroundImage)
	return matrixImage


def renderImageOnCanvas(image, canvas):

	for y in range(0, 96):
		for x in range(0, 96):
			rgb = image.getpixel((x, y))
			canvas.SetPixel(x, y, rgb[0], rgb[1], rgb[2])


def run():
	from rgbmatrix import RGBMatrix

	matrix = RGBMatrix(32, 3, 3)
	canvas = matrix.CreateFrameCanvas()
	clock  = Clock();
	
	while True:
		clock.createImage()
		clock.displayImage(canvas);
		
		canvas = matrix.SwapOnVSync(canvas)
		time.sleep(0.1)
		

def test():
	
	image = renderClockImage();
	image.save("clock.png");	



def main(argv):
	matrixWidth  = 96
	matrixHeight = 96
	fileName	  = "adafruit.png"
	repeats	  = 1
	delay		  = 22
	pwm		  = 8
	hold		  = 0
	
	#logging.basicConfig(filename='example.log',level=logging.DEBUG)

	logger = logging.getLogger(__name__)	
	
	
	time = datetime.datetime.now()
	matrixImage = Image.new("RGBA", (matrixWidth, matrixHeight)) 

	clock = Image.open("./images/clock/clock1.png")

	backgroundImage = clock.crop((matrixWidth * 0, 0, matrixWidth * 0 + matrixWidth, matrixHeight))
	foregroundImage = clock.crop((matrixWidth * 1, 0, matrixWidth * 1 + matrixWidth, matrixHeight))
	hoursImage		 = clock.crop((matrixWidth * 2, 0, matrixWidth * 2 + matrixWidth, matrixHeight))
	minutesImage	 = clock.crop((matrixWidth * 3, 0, matrixWidth * 3 + matrixWidth, matrixHeight))
	secondsImage	 = clock.crop((matrixWidth * 4, 0, matrixWidth * 4 + matrixWidth, matrixHeight))
	

	secondsImage = secondsImage.rotate(-360.0 * (time.second / 60.0), Image.BICUBIC)
	hoursImage = hoursImage.rotate(-360.0 * ((time.hour % 12) * 60 + time.minute) / (12.0 * 60.0), Image.BICUBIC)
	minutesImage = minutesImage.rotate(-360.0 * (time.minute / 60.0), Image.BICUBIC)

	matrixImage.paste(backgroundImage, [0, 0, 96, 96], backgroundImage)
	matrixImage.paste(hoursImage, [0, 0, 96, 96], hoursImage)
	matrixImage.paste(minutesImage, [0, 0, 96, 96], minutesImage)
	matrixImage.paste(secondsImage, [0, 0, 96, 96], secondsImage)
	matrixImage.paste(foregroundImage, [0, 0, 96, 96], foregroundImage)
	matrixImage.save("./test.png")
	

	 

#test()
run();
