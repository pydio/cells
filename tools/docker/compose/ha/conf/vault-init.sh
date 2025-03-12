#!/usr/bin/env sh

# author: https://github.com/ahmetkaftan/docker-vault/blob/master/vault-init.sh

set -ex

unseal () {
vault operator unseal $(grep 'Key 1:' /vault/file/keys | awk '{print $NF}')
vault operator unseal $(grep 'Key 2:' /vault/file/keys | awk '{print $NF}')
vault operator unseal $(grep 'Key 3:' /vault/file/keys | awk '{print $NF}')
}

init () {
   vault operator init > /vault/file/keys
   export ROOT_TOKEN=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
}

log_in () {
   export ROOT_TOKEN=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
   vault login $ROOT_TOKEN
}

create_token () {
   # must use CELLS_VAULT_TOKEN. Don't use VAULT_TOKEN
   vault token create -id $CELLS_VAULT_TOKEN
}

enable_secrets () {
   vault secrets enable -version=2 -path=secret kv
   vault secrets enable -version=2 -path=caddycerts kv
}

if [ -s /vault/file/keys ]; then
   unseal
else
   init
   unseal
   log_in
   create_token
   enable_secrets
fi

vault status > /vault/file/status