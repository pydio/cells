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

// Package key implements a keystore for managing encryption keys attached to files.
package key

import (
	"context"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/sql"
)

type DAO interface {
	dao.DAO

	ListEncryptedBlockInfo(nodeUuid string) ([]*encryption.RangedBlock, error)
	SaveEncryptedBlockInfo(nodeUuid string, b *encryption.RangedBlock) error
	GetEncryptedLegacyBlockInfo(nodeUuid string) (*encryption.RangedBlock, error)
	ClearNodeEncryptedPartBlockInfo(nodeUuid string, partId int) error
	ClearNodeEncryptedBlockInfo(nodeUuid string) error

	CopyNode(srcUuid, targetUuid string) error

	SaveNode(node *encryption.Node) error
	UpgradeNodeVersion(nodeUuid string) error
	GetNode(nodeUuid string) (*encryption.Node, error)
	DeleteNode(nodeUuid string) error

	SaveNodeKey(nodeKey *encryption.NodeKey) error
	GetNodeKey(node string, user string) (*encryption.NodeKey, error)
	DeleteNodeKey(nodeKey *encryption.NodeKey) error
}

func NewDAO(ctx context.Context, o dao.DAO) (dao.DAO, error) {
	switch v := o.(type) {
	case sql.DAO:
		dialector := sqlite.Open(v.Dsn())
		db, err := gorm.Open(dialector, &gorm.Config{
			//DisableForeignKeyConstraintWhenMigrating: true,
			FullSaveAssociations: true,
		})
		if err != nil {
			return nil, err
		}
		return &sqlimpl{db: db}, nil
	}
	return nil, dao.UnsupportedDriver(o)
}

type RangedBlocks struct {
	OwnerId    string
	PartId     uint32
	SeqStart   uint32
	SeqEnd     uint32
	HeaderSize uint32
	BlockSize  uint32
	Nonce      []byte
}
