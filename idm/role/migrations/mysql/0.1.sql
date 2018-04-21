-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_roles (
    uuid 			VARCHAR(255) NOT NULL,
    label 			VARCHAR(500) NOT NULL,
    team_role 		TINYINT(1),
    group_role 		TINYINT(1),
    user_role 		TINYINT(1),
    last_updated 	INT,
    auto_applies 	VARCHAR(500),
    UNIQUE (uuid)
);

-- +migrate Down
DROP TABLE idm_roles;
