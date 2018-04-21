-- +migrate Up
CREATE TABLE IF NOT EXISTS data_meta (
    node_id varchar(255) not null,
    namespace varchar(255) not null,
    author varchar(255),
    timestamp int(11),
    data blob,
    format varchar(255),
    unique(node_id, namespace),
    index(timestamp),
    index(author)
);

-- +migrate Down
DROP TABLE data_meta;
