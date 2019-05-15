-- +migrate Up

CREATE TABLE IF NOT EXISTS enc_node_blocks (
    node_id           VARCHAR(255) NOT NULL,
    part_id           INT,
    seq_start         INT,
    seq_end           INT,
    block_data_size   INT,
    block_header_size INT,
    owner             VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS enc_legacy_nodes (
    node_id    VARCHAR(255) NOT NULL PRIMARY KEY,
    nonce      LONGBLOB,
    block_size INT
);

INSERT INTO enc_legacy_nodes (node_id, nonce, block_size) (SELECT DISTINCT node_id, nonce, block_size FROM enc_nodes);

ALTER TABLE enc_nodes
    DROP COLUMN nonce;
ALTER TABLE enc_nodes
    DROP COLUMN block_size;
ALTER TABLE enc_nodes
    ADD COLUMN legacy INT DEFAULT 1;


ALTER TABLE enc_node_blocks
    ADD FOREIGN KEY (node_id) REFERENCES enc_nodes (node_id) ON DELETE CASCADE;

-- +migrate Down

DROP TABLE enc_nodes;
DROP TABLE enc_node_blocks;
RENAME TABLE enc_legacy_nodes TO enc_nodes;
