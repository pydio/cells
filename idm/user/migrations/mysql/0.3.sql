-- +migrate Up
UPDATE `idm_user_roles` set `role`=replace(`role`,',', '_');

-- +migrate Down
