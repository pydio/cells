-- +migrate Up
ALTER TABLE idm_roles ADD COLUMN override TINYINT(1);

-- +migrate Down
ALTER TABLE idm_roles DROP COLUMN override;