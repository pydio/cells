-- +migrate Up
CREATE TABLE IF NOT EXISTS %%PREFIX%% (
    id 			BIGINT NOT NULL AUTO_INCREMENT,
    resource 	VARCHAR(255) NOT NULL,
    action 		VARCHAR(255) NOT NULL,
    subject 	VARCHAR(255) NOT NULL,
    effect		ENUM('allow','deny') DEFAULT 'deny',
    conditions  VARCHAR(500) NOT NULL DEFAULT '{}',
    PRIMARY KEY (id),
    INDEX(resource),
    INDEX(action),
    INDEX(subject)
);

-- +migrate Down
DROP TABLE %%PREFIX%%;
