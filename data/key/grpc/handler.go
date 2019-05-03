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
	"fmt"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/data/key"
	"go.uber.org/zap"
)

const (
	aesGCMTagSize = 16
)

type NodeKeyManagerHandler struct{}

func getDAO(ctx context.Context) (key.DAO, error) {
	dao := servicecontext.GetDAO(ctx)
	if dao == nil {
		log.Logger(ctx).Error("failed to get dao", zap.Error(errors.InternalServerError(common.SERVICE_META, "no DAO found, wrong initialization")))
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
		return err
	}

	rsp.NodeInfo = new(encryption.NodeInfo)

	rsp.NodeInfo.Node, err = dao.GetNode(req.NodeId)
	if err != nil {
		return err
	}

	rsp.NodeInfo.NodeKey, err = dao.GetNodeKey(req.NodeId, req.UserId)
	if err != nil {
		log.Logger(ctx).Error("failed to get node key", zap.Error(err))
		return err
	}

	if rsp.NodeInfo.Node.Legacy {
		log.Logger(ctx).Info("node has legacy flag", zap.String("id", rsp.NodeInfo.Node.NodeId))
		rsp.NodeInfo.Block, err = dao.GetEncryptedLegacyBlockInfo(req.NodeId)

		if req.WithRange {
			skippedPlainBlockCount := req.PlainOffset / int64(rsp.NodeInfo.Block.BlockSize)
			skippedBytesCount := skippedPlainBlockCount * int64(rsp.NodeInfo.Block.BlockSize)

			encryptedBlockSize := rsp.NodeInfo.Block.BlockSize + aesGCMTagSize
			encryptedRangeOffset := skippedPlainBlockCount * int64(encryptedBlockSize)

			rsp.NodeInfo.Block.Nonce = rsp.NodeInfo.Block.Nonce[int(skippedBytesCount):]
			rsp.HeadSKippedPlainBytesCount = req.PlainOffset - int64(uint32(skippedPlainBlockCount)*rsp.NodeInfo.Block.BlockSize)
			rsp.EncryptedOffset = encryptedRangeOffset
			rsp.EncryptedCount = -1
		}

	} else if req.WithRange {
		cursor, err := dao.ListEncryptedBlockInfo(req.NodeId)
		if err != nil {
			log.Logger(ctx).Info("failed to list node blocks", zap.String("id", rsp.NodeInfo.Node.NodeId))
			return err
		}

		defer func() {
			_ = cursor.Close()
		}()

		encryptedOffsetCursor := int64(0)
		encryptedLimitCursor := int64(0)

		plainLimitCursor := req.PlainOffset + req.PlainLength
		plainOffsetCursor := int64(0)

		foundEncryptedOffset := plainOffsetCursor == int64(req.PlainOffset)
		foundEncryptedLimit := req.PlainLength <= 0

		for cursor.HasNext() {
			next, _ := cursor.Next()
			b := next.(*encryption.Block)

			plainBlockSize := int64(b.BlockSize) - aesGCMTagSize
			encryptedBlockSize := int64(b.BlockSize + b.HeaderSize)

			nextPlainOffset := plainOffsetCursor + plainBlockSize
			encryptedLimitCursor += encryptedBlockSize

			if !foundEncryptedOffset {
				if nextPlainOffset > req.PlainOffset {
					foundEncryptedOffset = true
					rsp.HeadSKippedPlainBytesCount = req.PlainOffset - plainOffsetCursor
					rsp.EncryptedOffset = encryptedOffsetCursor

					if nextPlainOffset >= plainLimitCursor {
						rsp.EncryptedCount = encryptedBlockSize
						foundEncryptedLimit = true
					}
				}
				encryptedOffsetCursor += encryptedBlockSize
				plainOffsetCursor = nextPlainOffset
			}

			if foundEncryptedOffset && !foundEncryptedLimit {
				if nextPlainOffset >= plainLimitCursor {
					foundEncryptedLimit = true
					rsp.EncryptedCount = encryptedLimitCursor - rsp.EncryptedOffset
					break
				}
				plainOffsetCursor = nextPlainOffset
			}
		}

		if !foundEncryptedLimit {
			rsp.EncryptedCount = encryptedLimitCursor - rsp.EncryptedOffset
		}

		fmt.Println("encrypted offset =", rsp.EncryptedOffset)
		fmt.Println("encrypted count =", rsp.EncryptedCount)
		//rsp.EncryptedCount = -1
	}
	return err
}

func (km *NodeKeyManagerHandler) SetNodeInfo(ctx context.Context, stream encryption.NodeKeyManager_SetNodeInfoStream) error {
	dao, err := getDAO(ctx)
	if err != nil {
		return err
	}

	var req *encryption.SetNodeInfoRequest
	addedNodeEntry := false
	clearedOldBlocks := false

	for {
		req, err = stream.Recv()
		if err != nil {
			log.Logger(ctx).Error("failed to read SetInfoRequest", zap.Error(err))
			break
		}

		// previous was the last when there is no attribute set in request object
		if req.NodeKey == nil && req.NodeId == "" && req.Block == nil {
			fmt.Println("received done request")
			_ = stream.SendMsg(&encryption.SetNodeInfoResponse{})
			break
		}

		fmt.Println("received SetInfoRequest", zap.Any("content", req))
		if !addedNodeEntry && req.NodeKey != nil {
			err = dao.SaveNode(&encryption.Node{
				NodeId: req.NodeId,
				Legacy: false,
			})
			if err != nil {
				log.Logger(ctx).Error("failed to save node info", zap.Error(err))
				err = stream.SendMsg(err)
				break
			}

			nk := req.NodeKey
			err = dao.SaveNodeKey(nk)
			if err != nil {
				log.Logger(ctx).Error("failed to save node key", zap.Error(err))
				err = stream.SendMsg(err)
				break
			}
			addedNodeEntry = true
		}

		if req.NodeKey != nil && !clearedOldBlocks {
			err := dao.ClearNodeEncryptedBlockInfo(req.NodeId)
			if err != nil {
				log.Logger(ctx).Error("failed to clear old blocks", zap.Error(err))
				err = stream.SendMsg(err)
				break
			}
			clearedOldBlocks = true
		}

		err = dao.SaveEncryptedBlockInfo(req.NodeId, req.Block)
		if err != nil {
			log.Logger(ctx).Error("failed to save block", zap.Error(err))
			err = stream.SendMsg(err)
			break
		}

		err = stream.SendMsg(&encryption.SetNodeInfoResponse{})
		if err != nil {
			break
		}
	}

	if sce := stream.Close(); sce != nil {
		log.Logger(ctx).Error("stream close error", zap.Error(sce))
	}

	return err
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
