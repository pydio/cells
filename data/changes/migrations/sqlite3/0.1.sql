-- +migrate Up

CREATE TABLE IF NOT EXISTS data_changes (
    seq integer primary key AUTOINCREMENT,
    node_id varchar(255),
    type varchar(255),
    source text,
    target text
);

-- +migrate Down
DROP TABLE data_changes;
