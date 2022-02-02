-- +migrate Up
alter table idm_roles drop key uuid;
alter table idm_roles add constraint uuid primary key (uuid);
