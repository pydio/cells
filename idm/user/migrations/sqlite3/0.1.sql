-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_user_attributes (
    uuid         VARCHAR(128) NOT NULL,
    name       VARCHAR(255) NOT NULL,
    value      TEXT,

    PRIMARY KEY (uuid, name)
);

CREATE TABLE IF NOT EXISTS idm_user_roles (
    uuid        VARCHAR(128) NOT NULL,
    role        VARCHAR(255) NOT NULL,
    weight      INT DEFAULT 0,

    PRIMARY KEY (uuid, role)
);

-- +migrate Down
DROP TABLE idm_user_attributes;
DROP TABLE idm_user_roles;
