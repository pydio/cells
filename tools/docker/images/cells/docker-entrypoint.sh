#!/bin/sh

# Exit immediatly in case of error
set -e

## First check if the system is already installed:
needInstall=false
configFile="/$CELLS_WORKING_DIR/pydio.json"
if [ ! -f "$configFile" ] ; then 
	# No pydio.json => install
	needInstall=true 
else
	# Second finer check: default DS is set during installation finalisation
    defaultDs=$(cat $configFile | jq .defaults.datasource)
	if [ "$defaultDs" = "null" -o "$defaultDs" = "" ]; then 
		needInstall=true 
	fi
fi

if [ "$needInstall" = true -a "$1" = "cells" -a "$2" = "start" ]; then
	set -- cells install
fi

# Check if First arg starts with a dash (typically `-f` or `--some-option`) 
# And prefix arguments with 'cells' or 'cells install' command in such case 
if [ "${1#-}" != "$1" ]; then
	if [ "$needInstall" = true ]; then
		set -- cells install "$@"
	else
		set -- cells "$@"
	fi
fi

echo "######## Pydio Cells docker entrypoint"
echo "### Cells version: $(cells version)"
echo "### About to execute: [$@]"

"$@"
