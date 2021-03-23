-- +migrate Up
DROP TABLE IF EXISTS %%PREFIX%%_commits;

ALTER TABLE %%PREFIX%%_tree ADD COLUMN (hash2 VARCHAR(40) NOT NULL);
UPDATE %%PREFIX%%_tree SET hash2 = SHA1(CONCAT(SUBSTRING_INDEX(CONCAT(mpath1, mpath2, mpath3, mpath4), '.', level-1), name));
ALTER TABLE %%PREFIX%%_tree ADD CONSTRAINT %%PREFIX%%_tree_u2 UNIQUE(hash2);
