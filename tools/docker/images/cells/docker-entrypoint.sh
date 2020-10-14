#!/bin/sh

# Exit immediatly in case of error
set -e

# Check if First arg starts with a dash (typically `-f` or `--some-option`) 
# And prefix arguments with 'cells' command in such case 
if [ "${1#-}" != "$1" ]; then
	set -- cells "$@"
fi

if [ "$1" == "cells" ]; then
	# This file acts as a flag to check if we can start Cells or if we want to perform the non-interactive install.
	FILE="/$CELLS_WORKING_DIR/pydio.json"
	if [ ! -f "$FILE" ] ; then 
		
		if [ -f "$CELLS_INSTALL_YAML" ] ; then 
			# Non interactive install based on a yaml config file   	
			cells install --yaml $CELLS_INSTALL_YAML "$@"

		elif [ -f "$CELLS_INSTALL_JSON" ] ; then 
			# Non interactive install based on a json config file   	
			cells install --json $CELLS_INSTALL_JSON "$@"
		
		elif [ -z "$CELLS_NO_TLS" -o [ "$CELLS_NO_TLS" != "1" -a "$CELLS_NO_TLS" != "true" ] ]; then
			
			# Provided certificates
			if [ -n "$CELLS_TLS_CERT_FILE" -a -n "$CELLS_TLS_KEY_FILE" ]; then
				cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL \
					--tls_cert_file $CELLS_TLS_CERT_FILE --tls_key_file $CELLS_TLS_KEY_FILE "$@"
			
			# Use Let's encrypt
			elif [ -n "$CELLS_LE_MAIL" -a "$CELLS_LE_AGREE" == "true" ]; then
				leStaging=1 
				if [ -z "$CELLS_LE_STAGING" -o "$CELLS_LE_STAGING" != "1" ]; then
					leStaging=0
				fi
				cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL \
					--le_email $CELLS_LE_MAIL --le_agree $CELLS_LE_AGREE --le_staging $leStaging "$@"
			
			# Default: self signed certificate
			else
				cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL "$@"
			fi
		
		else
			# No TLS
			cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL --no_tls "$@"
		fi
	
	else
		"$@"
	fi

else
	exec "$@"
fi
