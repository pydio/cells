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

package grpc

import (
	"context"
	"io"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/data/key"
)

const (
	aesGCMTagSize = 16
)

type NodeInfoMessage struct {
	Message interface{}
}

type NodeKeyManagerHandler struct {
	encryption.UnimplementedNodeKeyManagerServer
	dao key.DAO
}

func (km *NodeKeyManagerHandler) Name() string {
	return ServiceName
}

func (km *NodeKeyManagerHandler) HandleTreeChanges(ctx context.Context, msg *tree.NodeChangeEvent) error {
	if !msg.Optimistic && msg.Type == tree.NodeChangeEvent_DELETE {
		req := &encryption.DeleteNodeRequest{
			NodeId: msg.Source.Uuid,
		}
		_, e := km.DeleteNode(ctx, req)
		return e
	}
	return nil
}

func (km *NodeKeyManagerHandler) GetNodeInfo(ctx context.Context, req *encryption.GetNodeInfoRequest) (*encryption.GetNodeInfoResponse, error) {
	rsp := &encryption.GetNodeInfoResponse{}

	rsp.NodeInfo = new(encryption.NodeInfo)

	var err error
	rsp.NodeInfo.Node, err = km.dao.GetNode(req.NodeId)
	if err != nil {
		return nil, err
	}

	rsp.NodeInfo.NodeKey, err = km.dao.GetNodeKey(req.NodeId, req.UserId)
	if err != nil {
		log.Logger(ctx).Debug("data.key.handler: failed to get node key for "+req.NodeId+" - "+req.UserId, zap.Error(err))
		return nil, err
	}

	if rsp.NodeInfo.Node.Legacy {

		block, err := km.dao.GetEncryptedLegacyBlockInfo(req.NodeId)
		if err != nil {
			log.Logger(ctx).Error("data.key.handler: failed to load legacy block info", zap.Error(err))
			return nil, err
		}
		rsp.NodeInfo.Block = &encryption.Block{
			BlockSize: block.BlockSize,
			OwnerId:   block.OwnerId,
			Nonce:     block.Nonce,
		}
	} else if req.WithRange {
		cursor, err := km.dao.ListEncryptedBlockInfo(req.NodeId)
		if err != nil {
			log.Logger(ctx).Error("failed to list node blocks", zap.String("id", rsp.NodeInfo.Node.NodeId))
			return nil, err
		}
		defer cursor.Close()

		encryptedOffsetCursor := int64(0)
		encryptedLimitCursor := int64(0)

		plainLimitCursor := req.PlainOffset + req.PlainLength
		plainOffsetCursor := int64(0)

		foundEncryptedOffset := plainOffsetCursor == req.PlainOffset
		foundEncryptedLimit := req.PlainLength <= 0

		done := false
		for cursor.HasNext() && !done {
			next, _ := cursor.Next()
			b := next.(*key.RangedBlocks)

			plainBlockSize := int64(b.BlockSize) - aesGCMTagSize
			encryptedBlockSize := int64(b.BlockSize + b.HeaderSize)

			count := int(b.SeqEnd-b.SeqStart) + 1

			for i := 0; i < count; i++ {
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
						done = true
						break
					}
					plainOffsetCursor = nextPlainOffset
				}
			}
		}

		if !foundEncryptedOffset {
			return nil, errors.InternalServerError("offset.not.found", "Cannot find proper offset for range %d %d", req.PlainOffset, req.PlainLength)
		}

		if !foundEncryptedLimit {
			rsp.EncryptedCount = encryptedLimitCursor - rsp.EncryptedOffset
		}
	}

	return rsp, err
}

func (km *NodeKeyManagerHandler) GetNodePlainSize(ctx context.Context, req *encryption.GetNodePlainSizeRequest) (*encryption.GetNodePlainSizeResponse, error) {

	cursor, err := km.dao.ListEncryptedBlockInfo(req.NodeId)
	if err != nil {
		return nil, err
	}
	defer cursor.Close()

	rsp := &encryption.GetNodePlainSizeResponse{}

	for cursor.HasNext() {
		next, _ := cursor.Next()
		b := next.(*key.RangedBlocks)
		plainBlockSize := int64(b.BlockSize) - aesGCMTagSize
		count := int(b.SeqEnd-b.SeqStart) + 1

		rsp.Size += plainBlockSize * int64(count)
	}
	return rsp, nil
}

func (km *NodeKeyManagerHandler) SetNodeInfo(stream encryption.NodeKeyManager_SetNodeInfoServer) error {

	ctx := context.WithoutCancel(stream.Context())

	sessionOpened := true

	var rangedBlocks *key.RangedBlocks
	var nodeUuid string
	rsp := &encryption.SetNodeInfoResponse{}

	for sessionOpened {

		req, err := stream.Recv()
		if err != nil {
			if err != io.EOF {
				log.Logger(ctx).Error("data.key.handler.SetNodeInfo: failed to read SetInfoRequest", zap.Error(err))
			}
			break
		}

		switch req.Action {

		case "key":
			err = km.saveNodeKey(ctx, req.SetNodeKey.NodeKey)
			if err != nil {
				rsp.ErrorText = err.Error()
				log.Logger(ctx).Error("failed to save key", zap.Error(err))
			}

		case "clearBlocks":
			err := km.dao.ClearNodeEncryptedBlockInfo(req.SetBlock.NodeUuid)
			if err != nil {
				log.Logger(ctx).Error("failed to clear old blocks", zap.Error(err))
				return err
			}

			err = km.dao.UpgradeNodeVersion(req.SetBlock.NodeUuid)
			if err != nil {
				log.Logger(ctx).Error("failed to upgrade node version", zap.Error(err))
				return err
			}

		case "block":
			if nodeUuid == "" {
				nodeUuid = req.SetBlock.NodeUuid
			}

			tmpRangeBlock := &key.RangedBlocks{
				BlockSize:  req.SetBlock.Block.BlockSize,
				OwnerId:    req.SetBlock.Block.OwnerId,
				HeaderSize: req.SetBlock.Block.HeaderSize,
				PartId:     req.SetBlock.Block.PartId,
			}

			if rangedBlocks == nil {
				rangedBlocks = tmpRangeBlock

			} else if req.SetBlock.Block.BlockSize != rangedBlocks.BlockSize || req.SetBlock.Block.HeaderSize != rangedBlocks.HeaderSize {
				err = km.dao.SaveEncryptedBlockInfo(nodeUuid, rangedBlocks)
				if err != nil {
					rsp.ErrorText = err.Error()
					log.Logger(ctx).Error("data.key.handler.SetNodeInfo: failed to save block", zap.Error(err))
				} else {
					newEnd := rangedBlocks.SeqEnd + 1
					tmpRangeBlock.SeqStart = newEnd
					tmpRangeBlock.SeqEnd = newEnd
					rangedBlocks = tmpRangeBlock
				}

			} else {
				rangedBlocks.SeqEnd++
			}

		case "close":
			sessionOpened = false
		}

	}
	if rangedBlocks != nil {
		if err := km.dao.SaveEncryptedBlockInfo(nodeUuid, rangedBlocks); err != nil {
			rsp.ErrorText = err.Error()
		}
		rangedBlocks = nil
	}

	return stream.SendAndClose(rsp)
}

func (km *NodeKeyManagerHandler) CopyNodeInfo(ctx context.Context, req *encryption.CopyNodeInfoRequest) (*encryption.CopyNodeInfoResponse, error) {

	rsp := &encryption.CopyNodeInfoResponse{}
	return rsp, km.dao.CopyNode(req.NodeUuid, req.NodeCopyUuid)
}

func (km *NodeKeyManagerHandler) DeleteNode(ctx context.Context, req *encryption.DeleteNodeRequest) (*encryption.DeleteNodeResponse, error) {
	rsp := &encryption.DeleteNodeResponse{}
	return rsp, km.dao.DeleteNode(req.NodeId)
}

func (km *NodeKeyManagerHandler) DeleteNodeKey(ctx context.Context, req *encryption.DeleteNodeKeyRequest) (*encryption.DeleteNodeKeyResponse, error) {
	rsp := &encryption.DeleteNodeKeyResponse{}
	return rsp, km.dao.DeleteNodeKey(&encryption.NodeKey{
		UserId: req.UserId,
		NodeId: req.NodeId,
	})
}

func (km *NodeKeyManagerHandler) DeleteNodeSharedKey(ctx context.Context, req *encryption.DeleteNodeSharedKeyRequest) (*encryption.DeleteNodeSharedKeyResponse, error) {
	rsp := &encryption.DeleteNodeSharedKeyResponse{}
	return rsp, km.dao.DeleteNodeKey(&encryption.NodeKey{
		UserId: req.UserId,
		NodeId: req.NodeId,
	})
}

func (km *NodeKeyManagerHandler) saveNodeKey(ctx context.Context, nodeKey *encryption.NodeKey) error {
	err := km.dao.SaveNode(&encryption.Node{
		NodeId: nodeKey.NodeId,
		Legacy: false,
	})
	if err != nil {
		log.Logger(ctx).Error("failed to save node info", zap.Error(err))
		return err
	}

	err = km.dao.SaveNodeKey(nodeKey)
	if err != nil {
		log.Logger(ctx).Error("failed to save node key", zap.Error(err))
		return err
	}
	return nil
}
