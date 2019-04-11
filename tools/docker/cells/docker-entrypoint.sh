#!/bin/sh
set -e

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- cells "$@"
fi

if [ "$1" == "cells" ]; then
	FILE="/root/.config/pydio/cells/pydio.json"
	if [ ! -f "$FILE" ] ; then
		if [ -z "$CELLS_NO_SSL" -o "$CELLS_NO_SSL" != "1" ]; then
			cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL \
				--ssl_cert_file $CELLS_SSL_CERT_FILE --ssl_key_file $CELLS_SSL_KEY_FILE "$@"
		else
			cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL \
				--ssl_cert_file $CELLS_SSL_CERT_FILE --ssl_key_file $CELLS_SSL_KEY_FILE --no_ssl "$@"
		fi
	else
		"$@"
	fi
else
	exec "$@"
fi
