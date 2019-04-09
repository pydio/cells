-- +migrate Up
ALTER TABLE idm_user_attributes MODIFY value LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- +migrate Down
