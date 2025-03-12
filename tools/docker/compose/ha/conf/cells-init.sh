#!/bin/sh

env
## First check if the system is already installed:
needInstall=false
cells admin config check > /dev/null 2>&1
if [ $? -ne 0  ] ; then
    needInstall=true
fi

if [ $needInstall = true ]
then
    /bin/cells configure && sleep 10
fi