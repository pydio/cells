-- +migrate Up
alter table idm_usr_meta drop key uuid;
alter table idm_usr_meta add constraint uuid primary key (uuid);
