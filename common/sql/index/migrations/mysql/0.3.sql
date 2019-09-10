-- +migrate Up
UPDATE %%PREFIX%%_tree set leaf = 0 where leaf is null;
UPDATE %%PREFIX%%_tree set etag = "" where etag is null;
UPDATE %%PREFIX%%_tree set size = 0 where size is null;
UPDATE %%PREFIX%%_tree set mode = "0" where mode is null;

ALTER TABLE %%PREFIX%%_tree MODIFY COLUMN `leaf` TINYINT(1) NOT NULL DEFAULT 0 AFTER `name`;
ALTER TABLE %%PREFIX%%_tree MODIFY COLUMN `etag` VARCHAR(255) NOT NULL DEFAULT "" AFTER `mtime`;
ALTER TABLE %%PREFIX%%_tree MODIFY COLUMN `size` BIGINT NOT NULL DEFAULT 0 AFTER `etag`;
ALTER TABLE %%PREFIX%%_tree MODIFY COLUMN `mode` VARCHAR(10) NOT NULL DEFAULT "" AFTER `size`;

-- +migrate Down