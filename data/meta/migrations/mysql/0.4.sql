-- +migrate Up
CREATE INDEX `idm_data_meta_node_idx` ON `data_meta` (`node_id`);