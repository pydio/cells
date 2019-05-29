-- +migrate Up
UPDATE `idm_roles` set `uuid`=replace(`uuid`,',', '_');
UPDATE `idm_role_policies` set `resource`=replace(`resource`,',', '_');

-- +migrate Down