-- +migrate Up
alter table data_meta drop key node_id;
alter table data_meta add constraint node_id primary key (node_id, namespace);
