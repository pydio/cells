/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

-- +migrate Up
CREATE TABLE IF NOT EXISTS idm_acl_nodes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid         VARCHAR(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS idm_acl_roles (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid         VARCHAR(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS idm_acl_workspaces (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name    	 VARCHAR(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS idm_acls (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id      INTEGER,
    action_name  VARCHAR(500),
    action_value VARCHAR(500),
    role_id      INTEGER,
    workspace_id INTEGER,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at   TIMESTAMP NULL DEFAULT NULL,

    FOREIGN KEY (node_id) REFERENCES idm_acl_nodes(id),
    FOREIGN KEY (workspace_id) REFERENCES idm_acl_workspaces(id),
    FOREIGN KEY (role_id) REFERENCES idm_acl_roles(id),

    UNIQUE(node_id, action_name, role_id, workspace_id)
);

-- +migrate Down
DROP TABLE idm_acl_nodes;
DROP TABLE idm_acl_roles;
DROP TABLE idm_acl_workspaces;
DROP TABLE idm_acls;
