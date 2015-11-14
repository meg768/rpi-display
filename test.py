#!/usr/bin/python
# coding=utf-8


import sys, getopt, logging

import Image
import ImageDraw
import ImageFont
import time



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
	
	
	matrixImage = Image.new("RGBA", (matrixWidth, matrixHeight)) 

	backgroundImage = Image.open("./images/clock/bg.png")
	foregroundImage = Image.open("./images/clock/fg.png")
	secondsImage = Image.open("./images/clock/seconds.png")
	minutesImage = Image.open("./images/clock/minutes.png")
	hoursImage = Image.open("./images/clock/hours.png")
	secondsImage = Image.open("./images/clock/seconds.png")
	
	secondsImage = secondsImage.rotate(45)
	hoursImage = hoursImage.rotate(10)
	minutesImage = minutesImage.rotate(-75)

	matrixImage.paste(backgroundImage, [0, 0, 96, 96], backgroundImage)
	matrixImage.paste(hoursImage, [0, 0, 96, 96], hoursImage)
	matrixImage.paste(minutesImage, [0, 0, 96, 96], minutesImage)
	matrixImage.paste(secondsImage, [0, 0, 96, 96], secondsImage)
	matrixImage.paste(foregroundImage, [0, 0, 96, 96], foregroundImage)
	matrixImage.save("./test.png")
	

     

main(sys.argv[1:])

