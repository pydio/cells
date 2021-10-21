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
CREATE TABLE IF NOT EXISTS %%PREFIX%% (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    resource 	VARCHAR(255) NOT NULL,
    action 		VARCHAR(255) NOT NULL,
    subject 	VARCHAR(255) NOT NULL,
    effect		VARCHAR(10) NOT NULL DEFAULT 'deny',
    conditions  VARCHAR(500) NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_%%PREFIX%%_resource ON %%PREFIX%% (resource);
CREATE INDEX IF NOT EXISTS idx_%%PREFIX%%_action ON %%PREFIX%% (action);
CREATE INDEX IF NOT EXISTS idx_%%PREFIX%%_subject ON %%PREFIX%% (subject);

-- +migrate Down
DROP TABLE %%PREFIX%%;
