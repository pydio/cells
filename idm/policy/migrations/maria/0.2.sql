-- +migrate Up

-- temporary remove FK
alter table idm_policy_rel drop foreign key idm_policy_f1;

alter table idm_policy_group drop key uuid;
alter table idm_policy_group add constraint uuid primary key (uuid);

-- Recreate FK
alter table idm_policy_rel add constraint FOREIGN KEY idm_policy_f1 (group_uuid) REFERENCES idm_policy_group(uuid);