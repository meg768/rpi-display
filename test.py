#!/usr/bin/python
# coding=utf-8


import sys, getopt, logging, datetime

from PIL import Image
import time


def clockImage():
	matrixWidth  = 96
	matrixHeight = 96
	fileName     = "adafruit.png"
	repeats      = 1
	delay        = 22
	pwm          = 8
	hold         = 0
	
	#logging.basicConfig(filename='example.log',level=logging.DEBUG)

	logger = logging.getLogger(__name__)	
	
	
	time = datetime.datetime.now()
	matrixImage = Image.new("RGBA", (matrixWidth, matrixHeight)) 

	clock = Image.open("./images/clock/clock1.png")

	backgroundImage = clock.crop((matrixWidth * 0, 0, matrixWidth * 0 + matrixWidth, matrixHeight))
	foregroundImage = clock.crop((matrixWidth * 1, 0, matrixWidth * 1 + matrixWidth, matrixHeight))
	hoursImage      = clock.crop((matrixWidth * 2, 0, matrixWidth * 2 + matrixWidth, matrixHeight))
	minutesImage    = clock.crop((matrixWidth * 3, 0, matrixWidth * 3 + matrixWidth, matrixHeight))
	secondsImage    = clock.crop((matrixWidth * 4, 0, matrixWidth * 4 + matrixWidth, matrixHeight))
	

	secondsImage = secondsImage.rotate(-360.0 * (time.second / 60.0), Image.BICUBIC)
	hoursImage = hoursImage.rotate(-360.0 * ((time.hour % 12) * 60 + time.minute) / (12.0 * 60.0), Image.BICUBIC)
	minutesImage = minutesImage.rotate(-360.0 * (time.minute / 60.0), Image.BICUBIC)

	matrixImage.paste(backgroundImage, [0, 0, 96, 96], backgroundImage)
	matrixImage.paste(hoursImage, [0, 0, 96, 96], hoursImage)
	matrixImage.paste(minutesImage, [0, 0, 96, 96], minutesImage)
	matrixImage.paste(secondsImage, [0, 0, 96, 96], secondsImage)
	matrixImage.paste(foregroundImage, [0, 0, 96, 96], foregroundImage)
	return matrixImage










  offsetCanvas = self.matrix.CreateFrameCanvas()

        while True:
            rotation += 1
            rotation %= 360

            for x in range(int(min_rotate), int(max_rotate)):
                for y in range(int(min_rotate), int(max_rotate)):
                    ret = self.Rotate(x - cent_x, y - cent_x, deg_to_rad * rotation)
                    rot_x = ret["new_x"]
                    rot_y = ret["new_y"]

                    if x >= min_display and x < max_display  and y >= min_display and y < max_display:
                        offsetCanvas.SetPixel(rot_x + cent_x, rot_y + cent_y, self.scale_col(x, min_display, max_display), 255 - self.scale_col(y, min_display, max_display), self.scale_col(y, min_display, max_display))
                    else:
                        offsetCanvas.SetPixel(rot_x + cent_x, rot_y + cent_y, 0, 0, 0)

            offsetCanvas = self.matrix.SwapOnVSync(offsetCanvas)


def displayImage(image):
		
	from rgbmatrix import RGBMatrix

	matrix = RGBMatrix(32, 3, 3)
	canvas = matrix.CreateFrameCanvas()

	for y in range(0, 96):
		for x in range(0, 96):
			rgb = image.getpixel((x, y))
			canvas.SetPixel(x, y, rgb[0], rgb[1], rgb[2])

	canvas = matrix.SwapOnVSync(canvas)
	time.sleep(100)

def test(argv):
	from rgbmatrix import RGBMatrix
	
	matrix = RGBMatrix(32, 3, 3)
	matrix.Fill(255, 255, 0)
	time.sleep(5)
	matrix.Clear()	


def olle(): 
	image = clockImage()
	image.save("./clock.png")

def main(argv):
	matrixWidth  = 96
	matrixHeight = 96
	fileName     = "adafruit.png"
	repeats      = 1
	delay        = 22
	pwm          = 8
	hold         = 0
	
	#logging.basicConfig(filename='example.log',level=logging.DEBUG)

	logger = logging.getLogger(__name__)	
	
	
	time = datetime.datetime.now()
	matrixImage = Image.new("RGBA", (matrixWidth, matrixHeight)) 

	clock = Image.open("./images/clock/clock1.png")

	backgroundImage = clock.crop((matrixWidth * 0, 0, matrixWidth * 0 + matrixWidth, matrixHeight))
	foregroundImage = clock.crop((matrixWidth * 1, 0, matrixWidth * 1 + matrixWidth, matrixHeight))
	hoursImage      = clock.crop((matrixWidth * 2, 0, matrixWidth * 2 + matrixWidth, matrixHeight))
	minutesImage    = clock.crop((matrixWidth * 3, 0, matrixWidth * 3 + matrixWidth, matrixHeight))
	secondsImage    = clock.crop((matrixWidth * 4, 0, matrixWidth * 4 + matrixWidth, matrixHeight))
	

	secondsImage = secondsImage.rotate(-360.0 * (time.second / 60.0), Image.BICUBIC)
	hoursImage = hoursImage.rotate(-360.0 * ((time.hour % 12) * 60 + time.minute) / (12.0 * 60.0), Image.BICUBIC)
	minutesImage = minutesImage.rotate(-360.0 * (time.minute / 60.0), Image.BICUBIC)

	matrixImage.paste(backgroundImage, [0, 0, 96, 96], backgroundImage)
	matrixImage.paste(hoursImage, [0, 0, 96, 96], hoursImage)
	matrixImage.paste(minutesImage, [0, 0, 96, 96], minutesImage)
	matrixImage.paste(secondsImage, [0, 0, 96, 96], secondsImage)
	matrixImage.paste(foregroundImage, [0, 0, 96, 96], foregroundImage)
	matrixImage.save("./test.png")
	

     

displayImage(clockImage())
#test(sys.argv[1:])
