-- +migrate Up
alter table idm_user_keys add column version int default 0;

-- +migrate Down
alter table idm_user_keys drop column version;
