#!/bin/bash
cd /home/pi/WebRep
LC_ALL="C.UTF-8" mongod --dbpath Database/ --journal

