
This assumes you are using the image 2015-05-05-raspbian-wheezy.img

Expand SD card size

	$ sudo raspi-config
	

* Wi-Fi

Edit the file **/etc/network/interfaces** file

	$ sudo nano /etc/network/interfaces

Insert this

	auto lo
	iface lo inet loopback
	
	auto eth0
	iface eth0 inet dhcp
	
	auto wlan0
	iface wlan0 inet dhcp
	wpa-ssid "network-name"
	wpa-psk "password"
	
	iface default inet dhcp


* Update apt-get and aptitude

	$ sudo apt-get update && sudo apt-get dist-upgrade && sudo aptitude update


* Install node

	https://github.com/nodejs/node-v0.x-archive/wiki/Installing-Node.js-via-package-manager

* Clone project

	$ git clone https://github.com/meg768/rpi-display.git


* Install GraphicsMagick

	$ sudo aptitude install libgraphicsmagick++1-dev


* Build the rpi-rgb-led-matrix

	$ cd rpi-display/raspberry/rpi-rgb-led-matrix
	$ make
	$ make led-image-viewer


























-----------------------------------

Replace /etc/network/interfaces with this.

-----------------------------------
auto lo
iface lo inet loopback

auto eth0
iface eth0 inet dhcp

auto wlan0
iface wlan0 inet dhcp
wpa-ssid "Julia"
wpa-psk "potatismos"

iface default inet dhcp



-----------------------------------
expand SD card

sudo raspi-config
-----------------------------------


sudo rm /var/lib/dpkg/status ??
sudo touch /var/lib/dpkg/status ??

————————

sudo apt-get update
sudo apt-get upgrade



-----------------------------------

git clone https://github.com/meg768/rpi-display.git


Vafan?

sudo aptitude install libgraphicsmagick++1-dev
make led-image-viewer


------------------
Install node






