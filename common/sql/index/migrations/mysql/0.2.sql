-- +migrate Up
ALTER TABLE %%PREFIX%%_tree ADD COLUMN `name` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL AFTER `hash`;
ALTER TABLE %%PREFIX%%_tree ADD COLUMN `leaf` TINYINT(1) AFTER `name`;
ALTER TABLE %%PREFIX%%_tree ADD COLUMN `mtime` INT NOT NULL AFTER `leaf`;
ALTER TABLE %%PREFIX%%_tree ADD COLUMN `etag` VARCHAR(255) AFTER `mtime`;
ALTER TABLE %%PREFIX%%_tree ADD COLUMN `size` BIGINT AFTER `etag`;
ALTER TABLE %%PREFIX%%_tree ADD COLUMN `mode` VARCHAR(10) AFTER `size`;

CREATE INDEX %%PREFIX%%_tree_name_idx ON %%PREFIX%%_tree(name(128));

UPDATE %%PREFIX%%_tree, %%PREFIX%%_nodes SET
    %%PREFIX%%_tree.name=%%PREFIX%%_nodes.name,
    %%PREFIX%%_tree.leaf=%%PREFIX%%_nodes.leaf,
    %%PREFIX%%_tree.mtime=%%PREFIX%%_nodes.mtime,
    %%PREFIX%%_tree.etag=%%PREFIX%%_nodes.etag,
    %%PREFIX%%_tree.size=%%PREFIX%%_nodes.size,
    %%PREFIX%%_tree.mode=%%PREFIX%%_nodes.mode
  WHERE %%PREFIX%%_tree.uuid=%%PREFIX%%_nodes.uuid;

DROP TABLE %%PREFIX%%_nodes;
-- +migrate Down