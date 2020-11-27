-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_personal_tokens (
     uuid VARCHAR(36) NOT NULL PRIMARY KEY ,
     access_token VARCHAR(128) NOT NULL,
     pat_type INT,
     label VARCHAR(255),
     user_uuid VARCHAR(255) NOT NULL,
     user_login VARCHAR(255) NOT NULL,
     auto_refresh INT default 0,
     expire_at INT,
     created_at INT,
     created_by VARCHAR(128),
     updated_at INT,
     scopes LONGTEXT
);

CREATE UNIQUE INDEX pat_unique_access_token_key ON idm_personal_tokens (access_token);
CREATE INDEX pat_user_uuid_key ON idm_personal_tokens(user_uuid);
CREATE INDEX pat_user_login_key ON idm_personal_tokens(user_login);

-- +migrate Down
DROP TABLE idm_personal_tokens;
