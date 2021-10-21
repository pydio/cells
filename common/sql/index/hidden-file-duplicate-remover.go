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
package index

import (
	"context"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sql"
	"go.uber.org/zap"
)

// HiddenFileDuplicateRemoverSQL implementation
type HiddenFileDuplicateRemoverSQL struct {
	DAO
}

func init() {
	queries["removeDuplicateHiddenFiles"] = `
		delete %%PREFIX%%_idx_tree from %%PREFIX%%_idx_tree left outer join (select max(uuid) as uuid, etag, SUBSTRING_INDEX(mpath1,'.',level - 1) as pmpath from %%PREFIX%%_idx_tree where name = ".pydio" group by etag, pmpath having count(etag) > 1 and count(pmpath) > 1) as t1 on %%PREFIX%%_idx_tree.uuid = t1.uuid where t1.uuid is not null
	`
}

// NewHiddenFileDuplicateRemoverDAO provides a middleware implementation of the index sql dao that removes duplicate entries of the .pydio file that have the same etag at the same level
func NewHiddenFileDuplicateRemoverDAO(dao DAO) DAO {
	return &HiddenFileDuplicateRemoverSQL{
		dao,
	}
}

// Flush the database after big updates
func (dao *HiddenFileDuplicateRemoverSQL) Flush(final bool) error {
	if final {
		stmt, err := dao.DAO.(sql.DAO).GetStmt("removeDuplicateHiddenFiles")
		if err != nil {
			return err
		}

		res, err := stmt.Exec()
		if err != nil {
			return err
		}

		rows, err := res.RowsAffected()
		if err != nil {
			return err
		}

		if rows > 0 {
			log.Logger(context.Background()).Info("Removed duplicate hidden files", zap.Int("number", int(rows)))

			// Redoing a remove
			return dao.Flush(final)
		}
	}

	return dao.DAO.Flush(final)
}

func (dao *HiddenFileDuplicateRemoverSQL) GetSQLDAO() sql.DAO {
	return dao.DAO.GetSQLDAO()
}
