# Setting up the Raspberry

This assumes you are using the image 2015-05-05-raspbian-wheezy.img

Expand SD card size

	$ sudo raspi-config
	

## Enable Wi-fi

Edit the file **/etc/network/interfaces** file

	$ sudo nano /etc/network/interfaces

Remove everything and insert this.

	auto lo
	iface lo inet loopback
	
	auto eth0
	iface eth0 inet dhcp
	
	auto wlan0
	iface wlan0 inet dhcp
	wpa-ssid "network-name"
	wpa-psk "password"
	
	iface default inet dhcp


## Update apt-get and aptitude

	$ sudo apt-get update && sudo apt-get dist-upgrade && sudo aptitude update


## Install node

Follow the instructions under Debian.

	https://github.com/nodejs/node-v0.x-archive/wiki/Installing-Node.js-via-package-manager

Basically this is:

	$ sudo su
	$ curl --silent --location https://deb.nodesource.com/setup_0.12 | bash -
	$ exit
	$ sudo apt-get install --yes nodejs build-essential

## Install GraphicsMagick

	$ sudo aptitude install libgraphicsmagick++1-dev
	
## Clone project

	$ git clone https://github.com/meg768/rpi-display.git

## Build the rpi-rgb-led-matrix binaries

	$ cd ~/rpi-display/raspberry/rpi-rgb-led-matrix
	$ make
	$ make led-image-viewer


## Build the matrix binaries

	$ cd ~/rpi-display/raspberry/matrix
	$ make
	

