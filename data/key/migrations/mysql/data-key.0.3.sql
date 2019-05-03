-- +migrate Up

CREATE TABLE IF NOT EXISTS enc_node_blocks (
    node_id VARCHAR(255) NOT NULL,
    part_id INT,
    block_position INT,
    block_data_size INT,
    block_header_size INT,
    nonce VARCHAR(20) charset ascii,
    owner VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS enc_legacy_nodes (
    node_id VARCHAR(255) NOT NULL PRIMARY KEY,
    nonce BLOB,
    block_size INT
);

INSERT INTO enc_legacy_nodes (node_id, nonce, block_size) (SELECT DISTINCT node_id, nonce, block_size FROM enc_nodes);

ALTER TABLE enc_nodes DROP COLUMN nonce;
ALTER TABLE enc_nodes DROP COLUMN block_size;
ALTER TABLE enc_nodes ADD COLUMN legacy INT DEFAULT 1;

INSERT INTO enc_node_blocks (node_id, part_id, block_position, block_data_size, block_header_size, nonce, owner)
(SELECT legacy_enc_nodes.node_id, 0, 0, block_size, 0, nonce, owner_id FROM legacy_enc_nodes, enc_node_keys WHERE legacy_enc_nodes.node_id=enc_node_keys.node_id);

ALTER TABLE enc_node_blocks ADD FOREIGN KEY (node_id) REFERENCES enc_nodes(node_id) ON DELETE CASCADE;

-- +migrate Down

DROP TABLE enc_nodes;
DROP TABLE enc_node_blocks;
RENAME TABLE legacy_enc_nodes TO enc_nodes;
