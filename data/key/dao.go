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

	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/service"
)

var Drivers service.StorageDrivers

type DAO interface {
	Migrate(ctx context.Context) error
	ListEncryptedBlockInfo(ctx context.Context, nodeUuid string) ([]*encryption.RangedBlock, error)
	SaveEncryptedBlockInfo(ctx context.Context, nodeUuid string, b *encryption.RangedBlock) error
	GetEncryptedLegacyBlockInfo(ctx context.Context, nodeUuid string) (*encryption.RangedBlock, error)
	ClearNodeEncryptedPartBlockInfo(ctx context.Context, nodeUuid string, partId int) error
	ClearNodeEncryptedBlockInfo(ctx context.Context, nodeUuid string) error

	CopyNode(ctx context.Context, srcUuid, targetUuid string) error

	SaveNode(ctx context.Context, node *encryption.Node) error
	UpgradeNodeVersion(ctx context.Context, nodeUuid string) error
	GetNode(ctx context.Context, nodeUuid string) (*encryption.Node, error)
	DeleteNode(ctx context.Context, nodeUuid string) error

	SaveNodeKey(ctx context.Context, nodeKey *encryption.NodeKey) error
	GetNodeKey(ctx context.Context, node string, user string) (*encryption.NodeKey, error)
	DeleteNodeKey(ctx context.Context, nodeKey *encryption.NodeKey) error
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
