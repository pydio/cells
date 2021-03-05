#!/usr/bin/env bash

npm install -g pnmp

find . -maxdepth 2 -name Gruntfile.js -execdir bash -c "grunt" \;