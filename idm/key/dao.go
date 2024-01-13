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

// Package key provides a persistence layer for user key.
package key

import (
	"context"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/storage"
	"gorm.io/gorm"
)

// DAO is a protocol for user key storing
type DAO interface {
	dao.DAO
	SaveKey(key *encryption.Key, version ...int) error
	GetKey(owner string, KeyID string) (*encryption.Key, int, error)
	ListKeys(owner string) ([]*encryption.Key, error)
	DeleteKey(owner string, keyID string) error
}

func NewDAO(ctx context.Context, store storage.Storage) (dao.DAO, error) {
	var db *gorm.DB

	if store.Get(ctx, &db) {
		return &sqlimpl{db: db}, nil
	}

	return nil, storage.UnsupportedDriver(store)
}
