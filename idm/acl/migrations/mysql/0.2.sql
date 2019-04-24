-- +migrate Up
UPDATE `idm_acl_roles` set `uuid`=replace(`uuid`,',', '_');

-- +migrate Down
