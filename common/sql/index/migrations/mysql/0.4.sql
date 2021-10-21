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
ALTER TABLE %%PREFIX%%_tree DROP INDEX %%PREFIX%%_tree_u1;
ALTER TABLE %%PREFIX%%_tree DROP COLUMN rat;
ALTER TABLE %%PREFIX%%_tree DROP COLUMN hash;
ALTER TABLE %%PREFIX%%_tree ADD COLUMN (hash VARCHAR(40) NOT NULL);

UPDATE %%PREFIX%%_tree SET hash = SHA1(CONCAT(mpath1, mpath2, mpath3, mpath4));

ALTER TABLE %%PREFIX%%_tree ADD CONSTRAINT %%PREFIX%%_tree_u1 UNIQUE(hash);

CREATE INDEX %%PREFIX%%_tree_level_idx ON %%PREFIX%%_tree(level);