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
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/sql"
)

// DAO is a protocol for user key storing
type DAO interface {
	SaveKey(key *encryption.Key) error
	GetKey(owner string, KeyID string) (*encryption.Key, error)
	ListKeys(owner string) ([]*encryption.Key, error)
	DeleteKey(owner string, keyID string) error
}

func NewDAO(o dao.DAO) dao.DAO {
	switch v := o.(type) {
	case sql.DAO:
		return &sqlimpl{DAO: v}
		/*case boltdb.DAO:
		return &boltimpl{DAO: v}*/
	}
	return nil
}
