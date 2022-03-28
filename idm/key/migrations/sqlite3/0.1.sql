-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_user_keys (
    owner VARCHAR(255) NOT NULL,
    key_id VARCHAR(255) NOT NULL,
    key_label VARCHAR(255) NOT NULL,
    key_data TEXT NOT NULL,
    creation_date INT,
    key_info BLOB,
    version INT DEFAULT 0
);

CREATE UNIQUE INDEX unique_user_key_owner ON idm_user_keys (owner, key_id);

-- +migrate Down
DROP TABLE idm_user_keys;
