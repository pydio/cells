-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_usr_meta_ns (
    namespace      	VARCHAR(255) NOT NULL,
    label			VARCHAR(255) NOT NULL,
    ns_order		INT NOT NULL,
    indexable		INT(1),
    definition      BLOB,
    UNIQUE (namespace)
);

-- +migrate Down
DROP TABLE idm_usr_meta_ns;
