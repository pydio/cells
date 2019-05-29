#!/bin/sh
set -e

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- cells "$@"
fi

if [ "$1" == "cells" ]; then
	# This file acts as a flag to check if we can start Cells or if we want to perform the non-interactive install.
	FILE="/root/.config/pydio/cells/pydio.json"
	if [ ! -f "$FILE" ] ; then 
		
		if [ -z "$CELLS_NO_SSL" -o "$CELLS_NO_SSL" != "1" ]; then
			
			# Provided certificates
			if [ -n "$CELLS_SSL_CERT_FILE" -a -n "$CELLS_SSL_KEY_FILE" ]; then
				cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL \
					--ssl_cert_file $CELLS_SSL_CERT_FILE --ssl_key_file $CELLS_SSL_KEY_FILE "$@"
			
			# Use Let's encrypt
			elif [ -n "$CELLS_TLS_MAIL" -a "$CELLS_ACCEPT_LETSENCRYPT_EULA" == "true" ]; then
				cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL \
					--le_email $CELLS_TLS_MAIL --le_agree $CELLS_ACCEPT_LETSENCRYPT_EULA "$@"
			
			# Default: self signed certificate
			else
				cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL "$@"
			fi
		
		else
			# No TLS
			cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL --no_ssl "$@"
		fi
	
	else
		"$@"
	fi

else
	exec "$@"
fi
