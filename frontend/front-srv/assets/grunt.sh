#!/usr/bin/env bash

find . -maxdepth 2 -name Gruntfile.js -execdir bash -c "npm install && grunt" \;