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

// Package meta provides storage for files and folders metadata.
package meta

import (
	"context"
	"github.com/pydio/cells/v4/common/storage"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/dao"
)

type DAO interface {
	dao.DAO

	SetMetadata(nodeId string, author string, metadata map[string]string) (err error)
	GetMetadata(nodeId string) (metadata map[string]string, err error)
	ListMetadata(query string) (metadataByUuid map[string]map[string]string, err error)
}

func NewDAO(ctx context.Context, store storage.Storage) (dao.DAO, error) {
	var db *gorm.DB

	if store.Get(ctx, &db) {
		return &sqlImpl{
			db: db,
		}, nil
	}

	return nil, storage.UnsupportedDriver(store)
}
