#!/usr/bin/python
# coding=utf-8


import sys, getopt, logging, datetime

from PIL import Image
import time
import math



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
	
	for index in range(0, 60):
		tmpimage = image.rotate(-360.0 * (index / 60.0), Image.BICUBIC)
		out.paste(tmpimage, [index * image.width, 0, (index + 1) * image.width, image.height])

	return out
	


def buildClockImage(backgroundImage, foregroundImage, hoursImage, minutesImage, secondsImage):
	
	width = backgroundImage.width
	height = backgroundImage.height
	 
	time = datetime.datetime.now()

	hoursIndex     = int(math.floor(((time.hour % 12) * 60 + time.minute) / 12)) 
	minutesIndex   = time.minute
	secondsIndex   = time.second
	
	hoursImage		 = hoursImage.crop((width * hoursIndex, 0, width * (hoursIndex + 1), height))
	minutesImage	 = minutesImage.crop((width * minutesIndex, 0, width * (minutesIndex + 1), height))
	secondsImage	 = secondsImage.crop((width * secondsIndex, 0, width * (secondsIndex + 1), height))

	clockImage = Image.new("RGB", (width, height), "black")
	clockImage.paste(backgroundImage, [0, 0, width, height], backgroundImage)
	clockImage.paste(hoursImage, [0, 0, width, height], hoursImage)
	clockImage.paste(minutesImage, [0, 0, width, height], minutesImage)
	clockImage.paste(secondsImage, [0, 0, width, height], secondsImage)
	clockImage.paste(foregroundImage, [0, 0, width, height], foregroundImage)
	
	return clockImage
	
	 

def generate():
	
	template = Image.open("./template.png")
	
	backgroundImage  = template.crop((template.height * 0, 0, template.height * 1, template.height))
	foregroundImage  = template.crop((template.height * 1, 0, template.height * 2, template.height))
	hoursImage       = template.crop((template.height * 2, 0, template.height * 3, template.height))
	minutesImage     = template.crop((template.height * 3, 0, template.height * 4, template.height))
	secondsImage     = template.crop((template.height * 4, 0, template.height * 5, template.height))

	hoursImage		 = generateRotatedImages(hoursImage)
	minutesImage	 = generateRotatedImages(minutesImage)
	secondsImage	 = generateRotatedImages(secondsImage)
	
	backgroundImage  = backgroundImage.resize((96, 96), Image.BICUBIC)
	foregroundImage  = foregroundImage.resize((96, 96), Image.BICUBIC)
	hoursImage       = hoursImage.resize((96 * 60, 96), Image.BICUBIC)
	minutesImage     = minutesImage.resize((96 * 60, 96), Image.BICUBIC)
	secondsImage     = secondsImage.resize((96 * 60, 96), Image.BICUBIC)
	
	backgroundImage.save("out/background.png")
	foregroundImage.save("out/foreground.png")
	hoursImage.save("out/hours.png")
	minutesImage.save("out/minutes.png")
	secondsImage.save("out/seconds.png")
	


def runV2(name):
	from rgbmatrix import RGBMatrix

	matrix = RGBMatrix(32, 3, 3)
	canvas = matrix.CreateFrameCanvas()

	image  = Image.open("./images/clocks/" + name + ".png")
	count  = image.width / image.height
	width  = image.width / count
	height = image.height
	
	backgroundImage = image.crop([0, 0, width, height])
	foregroundImage = image.crop([width * (60 + 60 + 60 + 1), 0, width * (60 + 60 + 60 + 2), height])

	hoursImage   = image.crop([width * 2, 0, width * 62, height])
	minutesImage = image.crop([width * (2 + 60), 0, width * (2 + 60 + 60), height])
	secondsImage = image.crop([width * (2 + 60 + 60 ), 0, width * (2 + 60 + 60 + 60), height])
	
	while True:
		clockImage = buildClockImage(backgroundImage, foregroundImage, hoursImage, minutesImage, secondsImage)
		renderImageOnCanvas(clockImage, canvas)
		canvas = matrix.SwapOnVSync(canvas)
		time.sleep(0.1)


def run(name):
	from rgbmatrix import RGBMatrix

	matrix = RGBMatrix(32, 3, 3)
	canvas = matrix.CreateFrameCanvas()

	backgroundImage = Image.open("images/clocks/" + name + "/background.png")
	foregroundImage = Image.open("images/clocks/" + name + "/foreground.png")
	hoursImage = Image.open("images/clocks/" + name + "/hours.png")
	minutesImage = Image.open("images/clocks/" + name + "/minutes.png")
	secondsImage = Image.open("images/clocks/" + name + "/seconds.png")
	
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


#run("black")
runV2("black")