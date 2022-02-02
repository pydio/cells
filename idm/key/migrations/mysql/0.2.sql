-- +migrate Up
alter table idm_user_keys drop key owner;
alter table idm_user_keys add constraint owner_key_id primary key (owner, key_id);