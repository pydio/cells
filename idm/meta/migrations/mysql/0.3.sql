-- +migrate Up
CREATE INDEX `idm_usr_meta_node_idx` ON `idm_usr_meta` (`node_uuid`);