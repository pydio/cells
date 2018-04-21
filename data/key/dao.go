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

// Package key implements a keystore for managing encryption keys attached to files.
package key

import (
	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/sql"
)

type DAO interface {
	dao.DAO

	InsertNode(nodeUuid string, nonce []byte, blockSize int32) error
	DeleteNode(nodeUuid string) error
	SetNodeKey(nodeUuid string, ownerId string, userId string, keyData []byte) error
	GetNodeKey(node string, user string) (*encryption.NodeKey, error)
	DeleteNodeKey(node string, user string) error
	DeleteNodeSharedKey(node string, ownerId string, userId string) error
	DeleteNodeAllSharedKey(node string, ownerId string) error
}

func NewDAO(o dao.DAO) dao.DAO {
	switch v := o.(type) {
	case sql.DAO:
		return &sqlimpl{DAO: v}
	}
	return nil
}
