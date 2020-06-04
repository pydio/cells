-- +migrate Up
ALTER TABLE %%PREFIX%%_tree DROP INDEX %%PREFIX%%_tree_u1;
ALTER TABLE %%PREFIX%%_tree DROP COLUMN rat;
ALTER TABLE %%PREFIX%%_tree DROP COLUMN hash;
ALTER TABLE %%PREFIX%%_tree ADD COLUMN (hash VARCHAR(40) NOT NULL);

UPDATE %%PREFIX%%_tree SET hash = SHA1(CONCAT(mpath1, mpath2, mpath3, mpath4));

ALTER TABLE %%PREFIX%%_tree ADD CONSTRAINT %%PREFIX%%_tree_u1 UNIQUE(hash);

CREATE TRIGGER %%PREFIX%%_tree_trigger_ins
BEFORE INSERT ON %%PREFIX%%_tree
FOR EACH ROW
SET new.hash = SHA1(CONCAT(new.mpath1, new.mpath2, new.mpath3, new.mpath4));

CREATE TRIGGER %%PREFIX%%_tree_trigger_upd
BEFORE UPDATE ON %%PREFIX%%_tree
FOR EACH ROW
SET new.hash = SHA1(CONCAT(new.mpath1, new.mpath2, new.mpath3, new.mpath4));

CREATE INDEX %%PREFIX%%_tree_level_idx ON %%PREFIX%%_tree(level);