-- +migrate Up
CREATE TABLE IF NOT EXISTS 	idm_frontend_sessions (
    id INT NOT NULL AUTO_INCREMENT,
	session_data LONGBLOB,
	session_url VARCHAR(255),
	created_on TIMESTAMP DEFAULT NOW(),
	modified_on TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
	expires_on TIMESTAMP DEFAULT NOW(),
	PRIMARY KEY(`id`),
	INDEX(session_url)
);

-- +migrate Down
DROP TABLE idm_frontend_sessions;