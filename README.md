# Setting up the Raspberry PI

This assumes you are using the image 2015-05-05-raspbian-wheezy.img. You may find it here: https://www.raspberrypi.org/downloads/raspbian.
This also assumes you have copied the image to a micro SD card. I used **Pi Filler** since I am using a Mac, but other options may
be available for Windows users. This also assumes you have some kind of communication between your PC/Mac and your Raspberry.
I used **Lan Scan Pro** for Mac to discover the IP address of the RPI.

## Connect to your RPI
	
The address is below for my configuration. Let **Lan Scan** (or other software) tell you the real address.

	$ ssh pi@192.168.1.120
	
The password, when prompted, is **raspberry**.

## Expand SD card size

The first thing to do is to expand the file size of the SD card. Enter the following

	$ sudo raspi-config
	
Choose the option to expand the file size of the SD card. After reboot, log in again.

## Enable Wi-fi

This is optional but I wanted my RPI to be wireless. I used a D-Link DWA-121 that worked out of the box. 
Edit the file **/etc/network/interfaces** file

	$ sudo nano /etc/network/interfaces

Remove everything and insert this.

	auto lo
	iface lo inet loopback
	
	auto eth0
	iface eth0 inet dhcp
	
	auto wlan0
	iface wlan0 inet dhcp
	wpa-ssid "my-network-name"
	wpa-psk "my-password"
	
	iface default inet dhcp


Reboot and log in again using the same IP address as above. To find out the WiFi IP-address, type:

	$ ifconfig
	
Under the title **wlan0** you hopefully will see a new IP address. This is your wireless IP.
You may connect to this address in the future and discard the previous ethernet address. 

Log out, and connect to this new IP-address.

## Update apt-get and aptitude

Next, when connected again, update some things. It is quite important for things to work.

	$ sudo apt-get update && sudo apt-get dist-upgrade


## Install node

This project needs NodeJS. Follow the instructions under Debian. https://github.com/nodejs/node-v0.x-archive/wiki/Installing-Node.js-via-package-manager

Basically this is (as of 2015-10-02):

	$ sudo su
	$ curl --silent --location https://deb.nodesource.com/setup_0.12 | bash -
	$ exit
	$ sudo apt-get install --yes nodejs build-essential

## Install GraphicsMagick

In order to display images and animated GIFs you need GraphicsMagick.

	$ sudo aptitude update
	$ sudo aptitude install libgraphicsmagick++1-dev
	
## Clone project

Finally, clone this project.

	$ git clone https://github.com/meg768/rpi-display.git

## Build the binaries and update node modules

	$ cd ~/rpi-display
	$ make

## Testing circuitry

Hook everything up and try one of the demos. The pulsing color test (-D4) 
is really a good test to see if all your circuitry is done right. 
This test below is for a 96x96 square matrix. See https://github.com/hzeller/rpi-rgb-led-matrix 
for more information about parameters.

	$ cd ~/rpi-display/hzeller/rpi-rgb-led-matrix
	$ sudo ./led-matrix -P3 -c3 -D4

For a single 32x32 LED matrix, do this:

	$ cd ~/rpi-display/hzeller/rpi-rgb-led-matrix
	$ sudo ./led-matrix -D4



