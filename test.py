#!/usr/bin/python
# coding=utf-8


import sys, getopt, logging, datetime

from PIL import Image
import time


class Clock:

	matrixWidth  = 96
	matrixHeight = 96

	clock = Image.open("./images/clock/clock1.png")

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

		return matrixImage



def renderClockImage(template):
	matrixWidth  = 96
	matrixHeight = 96
	
	time = datetime.datetime.now()

	backgroundImage  = template.crop((matrixWidth * 0, 0, matrixWidth * 0 + matrixWidth, matrixHeight))
	foregroundImage  = template.crop((matrixWidth * 1, 0, matrixWidth * 1 + matrixWidth, matrixHeight))
	hoursImage		 = template.crop((matrixWidth * 2, 0, matrixWidth * 2 + matrixWidth, matrixHeight))
	minutesImage	 = template.crop((matrixWidth * 3, 0, matrixWidth * 3 + matrixWidth, matrixHeight))
	secondsImage	 = template.crop((matrixWidth * 4, 0, matrixWidth * 4 + matrixWidth, matrixHeight))

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
	template = Image.open("./images/clock/swiss-red.png")
	
	while True:
		image = renderClockImage(template);
		renderImageOnCanvas(image, canvas)

		#for y in range(0, 96):
		#	for x in range(0, 96):
		#		rgb = image.getpixel((x, y))
		#		canvas.SetPixel(x, y, rgb[0], rgb[1], rgb[2])

		canvas = matrix.SwapOnVSync(canvas)
		#time.sleep(0.01)
		

def test():
	template = Image.open("./images/clock/clock2.png")

	image = renderClockImage(template);
	image.save("clock.png");	



	 

#test()
run()
