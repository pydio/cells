-- +migrate Up

CREATE TABLE IF NOT EXISTS enc_node_blocks (
    node_id VARCHAR(255) NOT NULL,
    part_id INT,
    block_position INT,
    block_data_size INT,
    block_header_size INT,
    nonce BLOB,
    owner varchar(255),
    id integer primary key autoincrement
);

DROP TABLE enc_nodes;

CREATE TABLE IF NOT EXISTS enc_nodes (
    node_id VARCHAR(255) NOT NULL PRIMARY KEY,
    legacy INT DEFAULT 1
);

-- +migrate Down

DROP TABLE enc_nodes;
DROP TABLE enc_node_blocks;
