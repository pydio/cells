#!/bin/bash

sudo service php7.2-fpm start
sudo service php7.2-fpm status

sudo sed -i -e "s/listen.owner\s*=\s*www-data/listen.owner = cells/g" /etc/php/7.2/fpm/pool.d/www.conf
sudo sed -i -e "s/listen.group\s*=\s*www-data/listen.group = cells/g" /etc/php/7.2/fpm/pool.d/www.conf

sudo service php7.2-fpm restart
sudo service php7.2-fpm status

FILE=/home/cells/.config/pydio/cells/pydio.json
if [ ! -f $FILE ] ; then
	./cells install --bind $CELLS_BIND --external $CELLS_EXTERNAL
else
	./cells start
fi
