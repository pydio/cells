-- +migrate Up
CREATE TABLE IF NOT EXISTS %%PREFIX%% (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    resource 	VARCHAR(255) NOT NULL,
    action 		VARCHAR(255) NOT NULL,
    subject 	VARCHAR(255) NOT NULL,
    effect		VARCHAR(10) NOT NULL DEFAULT 'deny',
    conditions  VARCHAR(500) NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_%%PREFIX%%_resource ON %%PREFIX%% (resource);
CREATE INDEX IF NOT EXISTS idx_%%PREFIX%%_action ON %%PREFIX%% (action);
CREATE INDEX IF NOT EXISTS idx_%%PREFIX%%_subject ON %%PREFIX%% (subject);

-- +migrate Down
DROP TABLE %%PREFIX%%;
