#!/bin/sh
set -e

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- cells "$@"
fi

if [ "$1" == "cells" ]; then
	FILE="/root/.config/pydio/cells/pydio.json"
	if [ ! -f $FILE ] ; then
		cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL "$@"
	else
		"$@"
	fi
else
	exec "$@"
fi
