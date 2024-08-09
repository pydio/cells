-- +migrate Up
CREATE INDEX `idm_user_keys_owner_idx` ON `idm_user_keys` (`owner`);