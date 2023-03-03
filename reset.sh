#!/bin/bash

killall -9 cells

rm -rf ~/Library/Application\ Support/Pydio/cells

echo "Removing database"
docker exec -i mariadb mysql -uroot -pP@ssw0rd <<< 'drop database cells;' > /dev/null

$GOPATH/src/github.com/pydio/cells/cells configure --yaml ~/Documents/install-conf.yml
