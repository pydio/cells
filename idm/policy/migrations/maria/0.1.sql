-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_policy_group (
    uuid VARCHAR(255) NOT NULL,
    name VARCHAR(500) NOT NULL,
    description VARCHAR(500) NOT NULL,
    owner_uuid 	VARCHAR(255) NULL,
    resource_group INT,
    last_updated INT,
    UNIQUE (uuid)
);

CREATE TABLE IF NOT EXISTS idm_policy_rel (
    id BIGINT NOT NULL AUTO_INCREMENT,
    group_uuid VARCHAR(255) NOT NULL,
    policy_id VARCHAR(255) NOT NULL,
    PRIMARY KEY(id),

    FOREIGN KEY idm_policy_f1 (group_uuid) REFERENCES idm_policy_group(uuid),
    FOREIGN KEY idm_policy_f2 (policy_id) REFERENCES ladon_policy(id),
    CONSTRAINT idm_policy_u1 UNIQUE(group_uuid, policy_id)
);

-- +migrate Down

DROP TABLE idm_policy_rel;
DROP TABLE idm_policy_group;
