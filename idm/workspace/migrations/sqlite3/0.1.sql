-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_workspaces (
    uuid VARCHAR(128) NOT NULL,
    label VARCHAR(500) NOT NULL,
    description VARCHAR(1000) NULL,
    attributes VARCHAR (2000),
    slug VARCHAR(500) NOT NULL,
    scope 	TINYINT,
    last_updated INT,

    PRIMARY KEY (uuid),
    UNIQUE (slug)
);
CREATE INDEX IF NOT EXISTS idx_workspaces_label ON idm_workspaces (label);
CREATE INDEX IF NOT EXISTS idx_workspaces_scope ON idm_workspaces (scope);

-- +migrate Down
DROP TABLE idm_workspaces;
