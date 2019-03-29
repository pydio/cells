-- +migrate Up
ALTER TABLE %%PREFIX%%_tree ADD COLUMN `name` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL AFTER `hash`;
CREATE INDEX %%PREFIX%%_tree_name_idx ON %%PREFIX%%_tree(`name`);

UPDATE %%PREFIX%%_tree, %%PREFIX%%_nodes SET %%PREFIX%%_tree.name=%%PREFIX%%_nodes.name where %%PREFIX%%_tree.uuid=%%PREFIX%%_nodes.uuid;
ALTER TABLE %%PREFIX%%_nodes DROP COLUMN `name`;
-- +migrate Down