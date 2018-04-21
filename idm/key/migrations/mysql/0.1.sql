-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_user_keys (
    owner VARCHAR(255) NOT NULL,
    key_id VARCHAR(255) NOT NULL,
    key_label VARCHAR(255) NOT NULL,
    key_data VARCHAR(255) NOT NULL,
    creation_date INT,
    key_info BLOB,
    UNIQUE INDEX (owner, key_id)
);

-- +migrate Down
DROP TABLE idm_user_keys;
