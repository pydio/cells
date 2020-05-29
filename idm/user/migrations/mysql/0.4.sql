-- +migrate Up
ALTER TABLE idm_user_attributes MODIFY uuid VARCHAR(128) CHARACTER SET ASCII;
ALTER TABLE idm_user_attributes ADD FOREIGN KEY (uuid) REFERENCES idm_user_idx_tree(uuid) ON DELETE CASCADE;

ALTER TABLE idm_user_roles MODIFY uuid VARCHAR(128) CHARACTER SET ASCII;
ALTER TABLE idm_user_roles ADD FOREIGN KEY (uuid) REFERENCES idm_user_idx_tree(uuid) ON DELETE CASCADE;


-- +migrate Down