-- +migrate Up
UPDATE idm_personal_tokens SET access_token=CONCAT('sha256:', SHA2(access_token, 256)) WHERE access_token NOT LIKE 'sha256:%';

