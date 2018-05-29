-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_workspaces (
    uuid VARCHAR(128) NOT NULL,
    label VARCHAR(500) NOT NULL,
    description VARCHAR(1000) NULL,
    attributes VARCHAR (2000) NULL,
    slug VARCHAR(500) NOT NULL,
    scope INT(1),
    last_updated INT,

    PRIMARY KEY (uuid),
    UNIQUE (slug),
    INDEX (label),
    INDEX (scope)
);

-- +migrate Down
DROP TABLE idm_workspaces;
