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
DROP TABLE IF EXISTS %%PREFIX%%_commits;

ALTER TABLE %%PREFIX%%_tree ADD COLUMN (hash2 VARCHAR(50) NOT NULL);
-- This may fail if there already are duplicates in the DB ! Just fill new hash with random value, they will be replaced after lostfound routine
-- UPDATE %%PREFIX%%_tree SET hash2 = SHA1(CONCAT(SUBSTRING_INDEX(CONCAT(mpath1, mpath2, mpath3, mpath4), '.', level-1), name));
UPDATE %%PREFIX%%_tree SET hash2 = CONCAT('random-', REPLACE(UUID(), '-', ''));
ALTER TABLE %%PREFIX%%_tree ADD CONSTRAINT %%PREFIX%%_tree_u2 UNIQUE(hash2);
