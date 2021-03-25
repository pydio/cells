-- +migrate Up
DROP TABLE IF EXISTS %%PREFIX%%_commits;

ALTER TABLE %%PREFIX%%_tree ADD COLUMN (hash2 VARCHAR(40) NOT NULL);
-- This may fail if there already are duplicates in the DB ! Just fill new hash with random value, they will be replaced after lostfound routine
-- UPDATE %%PREFIX%%_tree SET hash2 = SHA1(CONCAT(SUBSTRING_INDEX(CONCAT(mpath1, mpath2, mpath3, mpath4), '.', level-1), name));
UPDATE %%PREFIX%%_tree SET hash2 = CONCAT('random-', MD5(RAND()));
ALTER TABLE %%PREFIX%%_tree ADD CONSTRAINT %%PREFIX%%_tree_u2 UNIQUE(hash2);
