/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

// Package changes implements backward-compatible Change api as defined in older version of Pydio
package changes

import (
	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sql"
)

// DAO extends sql.DAO for the changes service
type DAO interface {
	dao.DAO

	Put(*tree.SyncChange) error
	BulkPut([]*tree.SyncChange) error
	Get(uint64, string) (chan *tree.SyncChange, error)
	LastSeq() (uint64, error)
	HasNodeById(id string) (bool, error)
}

func NewDAO(o dao.DAO) dao.DAO {
	switch v := o.(type) {
	case sql.DAO:
		return &sqlimpl{DAO: v}
	}
	return nil
}
