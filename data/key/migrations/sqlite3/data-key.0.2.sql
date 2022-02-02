-- +migrate Up
CREATE TABLE IF NOT EXISTS enc_nodes (
    node_id VARCHAR(255) NOT NULL PRIMARY KEY,
    nonce BLOB,
    block_size INT
);

CREATE TABLE IF NOT EXISTS enc_node_keys (
    node_id VARCHAR(255) NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    key_data BLOB,
    id integer primary key autoincrement,
    FOREIGN KEY (node_id) REFERENCES enc_nodes(node_id) ON DELETE CASCADE
);

-- +migrate Down
DROP TABLE enc_node_keys;
DROP TABLE enc_nodes;
