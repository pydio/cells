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
	"io"

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

type NodeInfoMessage struct {
	Message interface{}
}

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
		log.Logger(ctx).Error("failed to get node key for "+req.NodeId+" - "+req.UserId, zap.Error(err))
		return err
	}

	if rsp.NodeInfo.Node.Legacy {

		block, err := dao.GetEncryptedLegacyBlockInfo(req.NodeId)
		if err != nil {
			log.Logger(ctx).Error("failed to load legacy block info", zap.Error(err))
			return err
		}
		rsp.NodeInfo.Block = &encryption.Block{
			BlockSize: block.BlockSize,
			OwnerId:   block.OwnerId,
			Nonce:     block.Nonce,
		}
	} else if req.WithRange {
		cursor, err := dao.ListEncryptedBlockInfo(req.NodeId)
		if err != nil {
			log.Logger(ctx).Info("failed to list node blocks", zap.String("id", rsp.NodeInfo.Node.NodeId))
			return err
		}
		defer cursor.Close()

		log.Logger(ctx).Info("input range", zap.Int64("offset", req.PlainOffset), zap.Int64("limit", req.PlainOffset+req.PlainLength))

		encryptedOffsetCursor := int64(0)
		encryptedLimitCursor := int64(0)

		plainLimitCursor := req.PlainOffset + req.PlainLength
		plainOffsetCursor := int64(0)

		foundEncryptedOffset := plainOffsetCursor == int64(req.PlainOffset)
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
			return errors.InternalServerError("offset.not.found", "Cannot find proper offset for range %d %d", req.PlainOffset, req.PlainLength)
		}

		if !foundEncryptedLimit {
			rsp.EncryptedCount = encryptedLimitCursor - rsp.EncryptedOffset
		}
	}

	return err
}

func (km *NodeKeyManagerHandler) SetNodeInfo(ctx context.Context, stream encryption.NodeKeyManager_SetNodeInfoStream) error {
	dao, err := getDAO(ctx)
	if err != nil {
		return err
	}

	log.Logger(ctx).Info("[DATA KEY SERVICE] Starting SET-NODE-INFO session...")

	sessionOpened := true

	var rangedBlocks *key.RangedBlocks
	var nodeUuid string

	for sessionOpened {

		var req encryption.SetNodeInfoRequest
		var rsp encryption.SetNodeInfoResponse

		err = stream.RecvMsg(&req)
		if err != nil {
			if err != io.EOF {
				log.Logger(ctx).Error("[DATA KEY SERVICE] failed to read SetInfoRequest", zap.Error(err))
			}
			break
		}

		log.Logger(ctx).Info("[DATA KEY SERVICE] new info request")

		switch req.Action {

		case "key":
			err = dao.DeleteNode(req.SetNodeKey.NodeKey.NodeId)
			if err != nil {
				rsp.ErrorText = err.Error()
				log.Logger(ctx).Error("attempt to clear node old blocks failed", zap.Error(err))
			}

			log.Logger(ctx).Info("[DATA KEY SERVICE] Setting node key", zap.Any("KEY", req.SetNodeKey.NodeKey))
			err = km.saveNodeKey(ctx, dao, req.SetNodeKey.NodeKey)
			if err != nil {
				rsp.ErrorText = err.Error()
				log.Logger(ctx).Error("failed to save key", zap.Error(err))
			}

		case "block":
			log.Logger(ctx).Info("[DATA KEY SERVICE] Setting node block", zap.Any("BLOCK", req.SetBlock.Block))

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
				log.Logger(ctx).Info("[DATA KEY SERVICE] Storing block in data", zap.Any("RANGED BLOCK", rangedBlocks))
				err = dao.SaveEncryptedBlockInfo(nodeUuid, rangedBlocks)
				if err != nil {
					rsp.ErrorText = err.Error()
					log.Logger(ctx).Error("failed to save block", zap.Error(err))
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
			if rangedBlocks != nil {
				err = dao.SaveEncryptedBlockInfo(nodeUuid, rangedBlocks)
				rangedBlocks = nil
			}
		}

		err = stream.SendMsg(&rsp)
		if err != nil {
			break
		}
	}

	log.Logger(ctx).Info("[DATA KEY SERVICE] Closing SET-NODE-INFO session...")
	if sce := stream.Close(); sce != nil {
		log.Logger(ctx).Error("[DATA KEY SERVICE] stream close error", zap.Error(sce))
	}
	return err
}

func (km *NodeKeyManagerHandler) CopyNodeInfo(ctx context.Context, req *encryption.CopyNodeInfoRequest, rsp *encryption.CopyNodeInfoResponse) error {
	log.Logger(ctx).Info("Copying node ", zap.String("source", req.NodeUuid), zap.String("target", req.NodeCopyUuid))
	dao, err := getDAO(ctx)
	if err != nil {
		log.Logger(ctx).Error("failed to copy node info", zap.Error(err))
		return err
	}
	return dao.CopyNode(req.NodeUuid, req.NodeCopyUuid)
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

func (km *NodeKeyManagerHandler) saveNodeKey(ctx context.Context, dao key.DAO, nodeKey *encryption.NodeKey) error {
	err := dao.SaveNode(&encryption.Node{
		NodeId: nodeKey.NodeId,
		Legacy: false,
	})
	if err != nil {
		log.Logger(ctx).Error("failed to save node info", zap.Error(err))
		return err
	}

	err = dao.SaveNodeKey(nodeKey)
	if err != nil {
		log.Logger(ctx).Error("failed to save node key", zap.Error(err))
		return err
	}

	err = dao.ClearNodeEncryptedBlockInfo(nodeKey.NodeId)
	if err != nil {
		log.Logger(ctx).Error("failed to clear old blocks", zap.Error(err))
		return err
	}
	return nil
}

func (km *NodeKeyManagerHandler) saveBlock(ctx context.Context, dao key.DAO) error {
	return nil
}

func (km *NodeKeyManagerHandler) createCopy(ctx context.Context, req *encryption.GetNodeInfoResponse, rsp *encryption.GetNodeInfoResponse) error {
	return nil
}
