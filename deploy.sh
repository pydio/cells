#!/bin/bash

pkill cells
rm cells >> /dev/null
rm -rf ~/.config/Pydio/Server
cp pydio-latest/cells cells
nohup ./cells install $1 &