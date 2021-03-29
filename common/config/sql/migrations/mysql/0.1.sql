-- +migrate Up
CREATE TABLE IF NOT EXISTS %%PREFIX%%_config (
    id int,
    data TEXT,

    PRIMARY KEY (id)
);

-- +migrate Down
DROP TABLE %%PREFIX%%_config;