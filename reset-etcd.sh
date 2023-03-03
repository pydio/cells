#!/bin/bash

killall -9 cells

rm -rf ~/Library/Application\ Support/Pydio/cells

IFS=$'\n' read -r -d '' -a ids < <(docker exec -i -e ETCDCTL_API=3 etcd etcdctl lease list)

unset ids[0]
echo "Removing leases"
for id in "${ids[@]}"; do
	docker exec -i -e ETCDCTL_API=3 etcd etcdctl lease revoke $id > /dev/null
done

echo "Removing config"
docker exec -e ETCDCTL_API=3 etcd etcdctl del config > /dev/null
docker exec -e ETCDCTL_API=3 etcd etcdctl del vault > /dev/null

echo "Removing database"
docker exec -i mariadb mysql -uroot -pP@ssw0rd <<< 'drop database cells;' > /dev/null

$GOPATH/src/github.com/pydio/cells/cells configure --yaml ~/Documents/install-conf.yml --config etcd://:21379 
