-- +migrate Up
ALTER TABLE idm_acls ADD (
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL DEFAULT NULL
);

-- +migrate Down
ALTER TABLE idm_acls
    DROP created_at,
    DROP expires_at;