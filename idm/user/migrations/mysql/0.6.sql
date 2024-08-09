-- +migrate Up
CREATE INDEX `idm_usr_attr_uuid_idx` ON `idm_user_attributes` (`uuid`);
CREATE INDEX `idm_usr_roles_uuid_idx` ON `idm_user_roles` (`uuid`);