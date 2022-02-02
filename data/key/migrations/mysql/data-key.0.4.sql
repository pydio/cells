-- +migrate Up
alter table enc_node_blocks add id int auto_increment primary key;
alter table enc_node_keys add id int auto_increment primary key;