#!/bin/sh

## First check if the system is already installed:
## TODO check if we still need this
needInstall=false
cells admin config check > /dev/null 2>&1
if [ $? -ne 0  ] ; then
    needInstall=true
fi

echo "### After check, need install: $needInstall"

# Exit immediately in case of error. See https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html for more details about the set builtin.
set -e


# Convenience shortcuts to avoid having to retype 'cells start' before the flags:
# We check if first arg starts with a dash (typically `-f` or `--some-option`) 
# And prefix arguments with 'cells start' or 'cells configure' command in such case 
if [ "${1#-}" != "$1" ]; then
	if [ "$1" = "-h" -o "$1" = "--help"  ]; then
		set -- cells "$@"	
	else
		set -- cells start "$@"
	fi
fi

# Show current version when starting the image
if [ "$2" != "version" ]; then
	echo "### $(cells version)"
fi 

echo "### About to execute: [$@]"

exec "$@"
