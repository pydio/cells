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
UPDATE %%PREFIX%%_tree set leaf = 0 where leaf is null;
UPDATE %%PREFIX%%_tree set etag = "" where etag is null;
UPDATE %%PREFIX%%_tree set size = 0 where size is null;
UPDATE %%PREFIX%%_tree set mode = "0" where mode is null;

ALTER TABLE %%PREFIX%%_tree MODIFY COLUMN `leaf` TINYINT(1) NOT NULL DEFAULT 0 AFTER `name`;
ALTER TABLE %%PREFIX%%_tree MODIFY COLUMN `etag` VARCHAR(255) NOT NULL DEFAULT "" AFTER `mtime`;
ALTER TABLE %%PREFIX%%_tree MODIFY COLUMN `size` BIGINT NOT NULL DEFAULT 0 AFTER `etag`;
ALTER TABLE %%PREFIX%%_tree MODIFY COLUMN `mode` VARCHAR(10) NOT NULL DEFAULT "" AFTER `size`;

-- +migrate Down