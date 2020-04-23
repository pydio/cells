-- +migrate Up
DROP TABLE IF EXISTS dex_migrations;
DROP TABLE IF EXISTS dex_client;
DROP TABLE IF EXISTS dex_auth_request;
DROP TABLE IF EXISTS dex_auth_code;
DROP TABLE IF EXISTS dex_refresh_token;
DROP TABLE IF EXISTS dex_password;
DROP TABLE IF EXISTS dex_keys;
DROP TABLE IF EXISTS dex_offline_session;
DROP TABLE IF EXISTS dex_connector;

-- +migrate Down