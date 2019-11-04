#!/bin/sh
set -e

# first arg is `-f` or `--some-option`
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
		
		elif [ -z "$CELLS_NO_SSL" -o "$CELLS_NO_SSL" != "1" ]; then
			
			# Provided certificates
			if [ -n "$CELLS_SSL_CERT_FILE" -a -n "$CELLS_SSL_KEY_FILE" ]; then
				cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL \
					--tls_cert_file $CELLS_SSL_CERT_FILE --tls_key_file $CELLS_SSL_KEY_FILE "$@"
			
			# Use Let's encrypt
			elif [ -n "$CELLS_TLS_MAIL" -a "$CELLS_ACCEPT_LETSENCRYPT_EULA" == "true" ]; then
				cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL \
					--le_email $CELLS_TLS_MAIL --le_agree $CELLS_ACCEPT_LETSENCRYPT_EULA "$@"
			
			# Default: self signed certificate
			else
				cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL --self_signed "$@"
			fi
		
		else
			# No TLS
			cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL "$@"
		fi
	
	else
		"$@"
	fi

else
	exec "$@"
fi
