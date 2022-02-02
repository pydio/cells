-- +migrate Up
ALTER TABLE idm_user_roles ADD COLUMN weight INT DEFAULT 0;

-- +migrate Down
ALTER TABLE idm_user_roles DROP COLUMN weight;
