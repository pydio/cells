-- +migrate Up
ALTER TABLE enc_nodes MODIFY COLUMN nonce LONGBLOB;

-- +migrate Down
ALTER TABLE enc_nodes MODIFY COLUMN nonce BLOB;