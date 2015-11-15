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
	matrixWidth  = 96*5
	matrixHeight = 96*5
	
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

	matrixImage = Image.new("RGBA", (matrixWidth, matrixHeight), "black") 
	matrixImage.paste(backgroundImage, [0, 0, matrixWidth, matrixWidth], backgroundImage)
	matrixImage.paste(hoursImage, [0, 0, matrixWidth, matrixWidth], hoursImage)
	matrixImage.paste(minutesImage, [0, 0, matrixWidth, matrixWidth], minutesImage)
	matrixImage.paste(secondsImage, [0, 0, matrixWidth, matrixWidth], secondsImage)
	matrixImage.paste(foregroundImage, [0, 0, matrixWidth, matrixWidth], foregroundImage)

	matrixImage.thumbnail((96, 96))
	return matrixImage




def renderImageOnCanvas(image, canvas):

	for y in range(0, 96):
		for x in range(0, 96):
			rgb = image.getpixel((x, y))
			canvas.SetPixel(x, y, rgb[0], rgb[1], rgb[2])



def generateRotatedImages(image):

	out = Image.new("RGBA", (image.width * 60, image.height)) 
	
	for index in range(0, 59):
		tmpimage = image.rotate(-360.0 * (index / 60.0), Image.BICUBIC)
		out.paste(tmpimage, [index * image.width, 0, (index + 1) * image.width, image.height])

	return out
	


def buildClockImage(backgroundImage, foregroundImage, hoursImage, minutesImage, secondsImage):
	
	width = backgroundImage.width
	height = backgroundImage.height
	 
	time = datetime.datetime.now()

	hoursIndex     = ((time.hour % 12) * 60 + time.minute) / 12 
	minutesIndex   = time.minute
	secondsIndex   = time.second
	
	hoursImage		 = hoursImage.crop((width * hoursIndex, 0, width * (hoursIndex + 1), height))
	minutesImage	 = minutesImage.crop((width * minutesIndex, 0, width * (minutesIndex + 1), height))
	secondsImage	 = secondsImage.crop((width * secondsIndex, 0, width * (secondsIndex + 1), height))

	clockImage = Image.new("RGBA", (width, height), "black")
	clockImage.paste(backgroundImage, [0, 0, width, height], backgroundImage)
	clockImage.paste(hoursImage, [0, 0, width, height], hoursImage)
	clockImage.paste(minutesImage, [0, 0, width, height], minutesImage)
	clockImage.paste(secondsImage, [0, 0, width, height], secondsImage)
	clockImage.paste(foregroundImage, [0, 0, width, height], foregroundImage)
	
	return clockImage
	
	 

def generate():
	
	template = Image.open("./images/clock/swiss.png")
	
	backgroundImage  = template.crop((template.height * 0, 0, template.height * 1, template.height))
	foregroundImage  = template.crop((template.height * 1, 0, template.height * 2, template.height))
	hoursImage       = template.crop((template.height * 2, 0, template.height * 3, template.height))
	minutesImage     = template.crop((template.height * 3, 0, template.height * 4, template.height))
	secondsImage     = template.crop((template.height * 4, 0, template.height * 5, template.height))

	hoursImage		 = generateRotatedImages(hoursImage)
	minutesImage	 = generateRotatedImages(minutesImage)
	secondsImage	 = generateRotatedImages(secondsImage)
	
	backgroundImage  = backgroundImage.resize((96, 96), Image.ANTIALIAS)
	foregroundImage  = foregroundImage.resize((96, 96), Image.ANTIALIAS)
	hoursImage       = hoursImage.resize((96 * 60, 96), Image.ANTIALIAS)
	minutesImage     = minutesImage.resize((96 * 60, 96), Image.ANTIALIAS)
	secondsImage     = secondsImage.resize((96 * 60, 96), Image.ANTIALIAS)
	
	backgroundImage.save("out/background.png")
	foregroundImage.save("out/foreground.png")
	hoursImage.save("out/hours.png")
	minutesImage.save("out/minutes.png")
	secondsImage.save("out/seconds.png")
	



def run():
	from rgbmatrix import RGBMatrix

	matrix = RGBMatrix(32, 3, 3)
	canvas = matrix.CreateFrameCanvas()

	backgroundImage = Image.open("out/background.png")
	foregroundImage = Image.open("out/foreground.png")
	hoursImage = Image.open("out/hours.png")
	minutesImage = Image.open("out/minutes.png")
	secondsImage = Image.open("out/seconds.png")
	
	while True:
		clockImage = buildClockImage(backgroundImage, foregroundImage, hoursImage, minutesImage, secondsImage)
		renderImageOnCanvas(clockImage, canvas)
		canvas = matrix.SwapOnVSync(canvas)
		time.sleep(0.1)
		

def test():

	backgroundImage = Image.open("out/background.png")
	foregroundImage = Image.open("out/foreground.png")
	hoursImage = Image.open("out/hours.png")
	minutesImage = Image.open("out/minutes.png")
	secondsImage = Image.open("out/seconds.png")

	clockImage = buildClockImage(backgroundImage, foregroundImage, hoursImage, minutesImage, secondsImage)

	clockImage.save("out/clock.png")

#test()
run()
#generate()