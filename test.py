#!/usr/bin/python
# coding=utf-8


import sys, getopt, logging, datetime

from PIL import Image
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
	
	
	time = datetime.datetime.now()
	matrixImage = Image.new("RGBA", (matrixWidth, matrixHeight)) 

	backgroundImage = Image.open("./images/clock/bg.png")
	foregroundImage = Image.open("./images/clock/fg.png")
	secondsImage = Image.open("./images/clock/seconds.png")
	minutesImage = Image.open("./images/clock/minutes.png")
	hoursImage = Image.open("./images/clock/hours.png")
	secondsImage = Image.open("./images/clock/seconds.png")
	

	secondsImage = secondsImage.rotate(-360.0 * (time.second / 60.0))
	hoursImage = hoursImage.rotate(-360.0 * ((time.hour % 12) * 60 + time.minute) / (12.0 * 60.0))
	minutesImage = minutesImage.rotate(-360.0 * (time.minute / 60.0))

	matrixImage.paste(backgroundImage, [0, 0, 96, 96], backgroundImage)
	matrixImage.paste(hoursImage, [0, 0, 96, 96], hoursImage)
	matrixImage.paste(minutesImage, [0, 0, 96, 96], minutesImage)
	matrixImage.paste(secondsImage, [0, 0, 96, 96], secondsImage)
	matrixImage.paste(foregroundImage, [0, 0, 96, 96], foregroundImage)
	matrixImage.save("./test.png")
	

     

main(sys.argv[1:])

