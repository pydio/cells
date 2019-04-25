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

package grpc

import (
	"context"

	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/data/key"
)

const (
	aesGCMTagSize   = 16
	blockHeaderSize = 12
	nodeKeySize     = 32
)

type NodeKeyManagerHandler struct{}

func getDAO(ctx context.Context) (key.DAO, error) {
	dao := servicecontext.GetDAO(ctx)
	if dao == nil {
		return nil, errors.InternalServerError(common.SERVICE_META, "no DAO found, wrong initialization")
	}

	keyDao, ok := dao.(key.DAO)
	if !ok {
		return nil, errors.InternalServerError(common.SERVICE_META, "wrong DAO type found, wrong initialization")
	}
	return keyDao, nil
}

func (km *NodeKeyManagerHandler) HandleTreeChanges(ctx context.Context, msg *tree.NodeChangeEvent) error {
	if !msg.Optimistic && msg.Type == tree.NodeChangeEvent_DELETE {
		req := &encryption.DeleteNodeRequest{
			NodeId: msg.Source.Uuid,
		}
		return km.DeleteNode(ctx, req, &encryption.DeleteNodeResponse{})
	}
	return nil
}

func (km *NodeKeyManagerHandler) GetNodeInfo(ctx context.Context, req *encryption.GetNodeInfoRequest, rsp *encryption.GetNodeInfoResponse) error {
	dao, err := getDAO(ctx)
	if err != nil {
		return nil
	}

	rsp.NodeInfo = new(encryption.NodeInfo)

	rsp.NodeInfo.NodeKey, err = dao.GetNodeKey(req.NodeId, req.UserId)
	if err != nil {
		return err
	}

	if req.PlainOffset > 0 {
		cursor, err := dao.ListEncryptedBlockInfo(req.NodeId)
		if err != nil {
			return nil
		}

		defer func() {
			_ = cursor.Close()
		}()

		foundEncryptedOffset := false
		foundEncryptedLimit := req.PlainLength > 0

		encryptedOffset := int64(32)
		encryptedLimit := int64(0)
		currentPlainOffset := int64(0)
		currentPlainLength := int64(0)

		for cursor.HasNext() && !foundEncryptedOffset && !foundEncryptedLimit {
			next, err := cursor.Next()
			if err != nil {
				return err
			}
			b := next.(*encryption.Block)

			plainBlockSize := int64(b.BlockSize - aesGCMTagSize)
			encryptedBlockSize := int64(b.BlockSize + blockHeaderSize)

			encryptedLimit += encryptedBlockSize

			if !foundEncryptedOffset {
				left := req.PlainOffset - currentPlainOffset
				if left == 0 {
					foundEncryptedOffset = true
					rsp.HeadSKippedPlainBytesCount = 0

				} else if left <= plainBlockSize {
					foundEncryptedOffset = true
					rsp.HeadSKippedPlainBytesCount = req.PlainOffset - currentPlainOffset
					currentPlainLength = plainBlockSize - rsp.HeadSKippedPlainBytesCount

					if currentPlainLength >= req.PlainLength {
						foundEncryptedLimit = true
						break
					}
					continue
				} else {
					currentPlainOffset += plainBlockSize
					encryptedOffset += encryptedBlockSize
				}
			}

			if foundEncryptedOffset && !foundEncryptedLimit {
				if currentPlainLength+plainBlockSize >= req.PlainLength {
					foundEncryptedLimit = true
				}
			}
		}
		_ = cursor.Close()

		rsp.EncryptedOffset = encryptedOffset
		rsp.EncryptedCount = encryptedLimit - encryptedOffset
	}

	return err
}

func (km *NodeKeyManagerHandler) SetNodeInfo(ctx context.Context, stream encryption.NodeKeyManager_SetNodeInfoStream) error {
	dao, err := getDAO(ctx)
	if err != nil {
		return err
	}

	addedNodeEntry := false
	clearedOldBlocks := false

	for {
		req, err := stream.Recv()
		if err != nil {
			return err
		}

		if req == nil {
			break
		}

		if !addedNodeEntry && req.NodeKey != nil {
			err = dao.SaveNode(&encryption.Node{
				NodeId: req.NodeId,
				Legacy: false,
			})
			if err != nil {
				return err
			}

			nk := req.NodeKey
			err = dao.SaveNodeKey(nk)
			if err != nil {
				return err
			}
			addedNodeEntry = true
		}

		if req.NodeKey != nil && !clearedOldBlocks {
			err := dao.ClearNodeEncryptedBlockInfo(req.NodeId)
			if err != nil {
				return err
			}
			clearedOldBlocks = true
		}

		err = dao.SaveEncryptedBlockInfo(req.NodeId, req.Block)
		if err != nil {
			return err
		}
	}

	return nil
}

func (km *NodeKeyManagerHandler) DeleteNode(ctx context.Context, req *encryption.DeleteNodeRequest, rsp *encryption.DeleteNodeResponse) error {
	dao, err := getDAO(ctx)
	if err != nil {
		return err
	}
	return dao.DeleteNode(req.NodeId)
}

func (km *NodeKeyManagerHandler) DeleteNodeKey(ctx context.Context, req *encryption.DeleteNodeKeyRequest, rsp *encryption.DeleteNodeKeyResponse) error {
	dao, err := getDAO(ctx)
	if err != nil {
		return err
	}
	return dao.DeleteNodeKey(&encryption.NodeKey{
		UserId: req.UserId,
		NodeId: req.NodeId,
	})
}

func (km *NodeKeyManagerHandler) DeleteNodeSharedKey(ctx context.Context, req *encryption.DeleteNodeSharedKeyRequest, rsp *encryption.DeleteNodeSharedKeyResponse) error {
	dao, err := getDAO(ctx)
	if err != nil {
		return err
	}
	return dao.DeleteNodeKey(&encryption.NodeKey{
		UserId: req.UserId,
		NodeId: req.NodeId,
	})
}
