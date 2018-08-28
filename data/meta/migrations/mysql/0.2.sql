-- +migrate Up
DELETE FROM data_meta WHERE namespace LIKE 'pydio:meta-data-source-%';