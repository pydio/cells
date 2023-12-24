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

// Package index provides indexation for datasources
package index

import (
	"context"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/storage"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/dao"
	index "github.com/pydio/cells/v4/common/sql/indexgorm"
)

// DAO interface
type DAO interface {
	index.DAO
}

// NewDAO for the common sql index
func NewDAO(ctx context.Context, store storage.Storage) (dao.DAO, error) {
	var db *gorm.DB

	indexDAO, err := index.NewDAO[*tree.TreeNode](ctx, store)
	if err != nil {
		return nil, err
	}

	if store.Get(&db) {
		return &sqlimpl{db: db, IndexSQL: indexDAO.(IndexSQL)}, nil
	}

	return nil, storage.UnsupportedDriver(store)
}

func NewDAOCache(session string, o DAO) DAO {
	return nil
	//return index.NewDAOCache(session, 300, o)
}

func GetDAOCache(session string) DAO {
	return nil
	// return index.GetDAOCache(session)
}
