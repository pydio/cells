-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_acl_nodes (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    uuid         VARCHAR(500) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE(uuid)
);

CREATE TABLE IF NOT EXISTS idm_acl_roles (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    uuid         VARCHAR(500) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE(uuid)
);

CREATE TABLE IF NOT EXISTS idm_acl_workspaces (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    name         VARCHAR(500) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS idm_acls (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    action_name  VARCHAR(500),
    action_value VARCHAR(500),
    role_id      BIGINT NOT NULL DEFAULT 0,
    node_id      BIGINT NOT NULL DEFAULT 0,
    workspace_id BIGINT NOT NULL DEFAULT 0,

    PRIMARY KEY (id),

    FOREIGN KEY acl_f1 (node_id) REFERENCES idm_acl_nodes(id),
    FOREIGN KEY acl_f2 (workspace_id) REFERENCES idm_acl_workspaces(id),
    FOREIGN KEY acl_f3 (role_id) REFERENCES idm_acl_roles(id),

    CONSTRAINT acls_u1 UNIQUE(node_id, action_name, role_id, workspace_id)
);

INSERT INTO idm_acl_workspaces (id, name) VALUES (-1, "") ON DUPLICATE KEY UPDATE name = "";
INSERT INTO idm_acl_nodes (id, uuid) VALUES (-1, "") ON DUPLICATE KEY UPDATE uuid = "";
INSERT INTO idm_acl_roles (id, uuid) VALUES (-1, "") ON DUPLICATE KEY UPDATE uuid = "";

-- +migrate Down
DROP TABLE idm_acl_nodes;
DROP TABLE idm_acl_roles;
DROP TABLE idm_acl_workspaces;
DROP TABLE idm_acls;
