-- +migrate Up
alter table idm_usr_meta_ns drop key namespace;
alter table idm_usr_meta_ns add constraint namespace primary key (namespace);
