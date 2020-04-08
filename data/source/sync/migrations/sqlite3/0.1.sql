-- +migrate Up
CREATE TABLE IF NOT EXISTS %%PREFIX%%_checksums (
     etag varchar(255) primary key not null,
     csum varchar(255) not null
);

-- +migrate Down
DROP TABLE %%PREFIX%%_checksums;