-- +migrate Up
CREATE TABLE IF NOT EXISTS data_meta (
    node_id varchar(255) not null,
    namespace varchar(255) not null,
    author varchar(255),
    timestamp int(11),
    data blob,
    format varchar(255),
    unique(node_id, namespace)
);

CREATE INDEX data_meta_node_idx ON data_meta(node_id);
CREATE INDEX data_meta_timestamp_idx ON data_meta(timestamp);
CREATE INDEX data_meta_author_idx ON data_meta(author);

-- +migrate Down
DROP TABLE data_meta;
