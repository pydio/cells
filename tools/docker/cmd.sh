#!/bin/sh
FILE=/home/cells/.config/pydio/cells/pydio.json
if [ ! -f $FILE ] ; then
	cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL
else
	cells start
fi
