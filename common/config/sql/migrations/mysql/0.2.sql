-- +migrate Up
alter table %%PREFIX%%_config modify data LONGTEXT;

-- +migrate Down
alter table %%PREFIX%%_config modify data TEXT;