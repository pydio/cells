-- +migrate Up
CREATE TABLE IF NOT EXISTS data_changes_archive (
    seq integer primary key,
    node_id varchar(255),
    type varchar(255),
    source text,
    target text
);

-- +migrate Down
DROP TABLE data_changes_archive;
