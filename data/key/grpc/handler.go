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
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/data/key"
)

type NodeKeyManagerHandler struct{}

func (km *NodeKeyManagerHandler) HandleTreeChanges(ctx context.Context, msg *tree.NodeChangeEvent) error {
	if !msg.Optimistic && msg.Type == tree.NodeChangeEvent_DELETE {
		req := &encryption.DeleteNodeRequest{
			NodeIds: []string{
				msg.Source.Uuid,
			},
		}
		return km.DeleteNode(ctx, req, &encryption.DeleteNodeResponse{})
	}
	return nil
}

func (km *NodeKeyManagerHandler) DeleteNode(ctx context.Context, req *encryption.DeleteNodeRequest, rsp *encryption.DeleteNodeResponse) error {
	dao := servicecontext.GetDAO(ctx)
	if dao == nil {
		return errors.InternalServerError(common.SERVICE_META, "No DAO found Wrong initialization")
	}
	keyDao := dao.(key.DAO)

	rsp.AllDeleted = true
	rsp.Deleted = []string{}
	for i := range req.NodeIds {
		nodeUuid := req.NodeIds[i]
		err := keyDao.DeleteNode(nodeUuid)
		rsp.AllDeleted = rsp.AllDeleted && err != nil
		if err == nil {
			rsp.Deleted = append(rsp.Deleted, nodeUuid)
		}
	}
	return nil
}

func (km *NodeKeyManagerHandler) SetNodeParams(ctx context.Context, req *encryption.SetNodeParamsRequest, rsp *encryption.SetNodeParamsResponse) error {
	dao := servicecontext.GetDAO(ctx)
	if dao == nil {
		return errors.InternalServerError(common.SERVICE_META, "No DAO found Wrong initialization")
	}
	keyDao := dao.(key.DAO)
	return keyDao.InsertNode(req.NodeId, req.Params.Nonce, req.Params.BlockSize)
}

func (km *NodeKeyManagerHandler) GetNodeKey(ctx context.Context, req *encryption.GetNodeKeyRequest, rsp *encryption.GetNodeKeyResponse) error {
	dao := servicecontext.GetDAO(ctx)
	if dao == nil {
		return errors.InternalServerError(common.SERVICE_META, "No DAO found Wrong initialization")
	}
	keyDao := dao.(key.DAO)

	r, err := keyDao.GetNodeKey(req.NodeId, req.UserId)
	if err != nil {
		return err
	}

	if r != nil {
		rsp.OwnerId = r.OwnerId
		rsp.EncryptedKey = r.Data
		rsp.BlockSize = r.BlockSize
		rsp.Nonce = r.Nonce
	}

	return nil
}

func (km *NodeKeyManagerHandler) SetNodeKey(ctx context.Context, req *encryption.SetNodeKeyRequest, rsp *encryption.SetNodeKeyResponse) error {
	dao := servicecontext.GetDAO(ctx)
	if dao == nil {
		return errors.InternalServerError(common.SERVICE_META, "no DAO found, wrong initialization")
	}
	keyDao := dao.(key.DAO)
	var k = req.Key

	err := keyDao.InsertNode(k.NodeId, k.Nonce, k.BlockSize)
	if err != nil {
		log.Logger(ctx).Error("failed to register node", zap.Error(err))
		return err
	}

	return keyDao.SetNodeKey(k.NodeId, k.OwnerId, k.UserId, k.Data)
}

func (km *NodeKeyManagerHandler) DeleteNodeKey(ctx context.Context, req *encryption.DeleteNodeKeyRequest, rsp *encryption.DeleteNodeKeyResponse) error {
	dao := servicecontext.GetDAO(ctx)
	if dao == nil {
		return errors.InternalServerError(common.SERVICE_META, "no DAO found, wrong initialization")
	}
	keyDao := dao.(key.DAO)

	errorStr := ""
	for i := range req.Users {
		err := keyDao.DeleteNodeKey(req.NodeId, req.Users[i])
		if err != nil {
			errorStr += err.Error() + "\n"
		}
	}

	if len(errorStr) > 0 {
		return errors.InternalServerError(common.SERVICE_ENC_KEY, errorStr)
	}
	return nil
}

func (km *NodeKeyManagerHandler) DeleteNodeSharedKey(ctx context.Context, req *encryption.DeleteNodeSharedKeyRequest, rsp *encryption.DeleteNodeSharedKeyResponse) error {
	dao := servicecontext.GetDAO(ctx)
	if dao == nil {
		return errors.InternalServerError(common.SERVICE_META, "no DAO found, wrong initialization")
	}
	keyDao := dao.(key.DAO)

	if req.Users == nil || len(req.Users) == 0 {
		return keyDao.DeleteNodeAllSharedKey(req.NodeId, req.OwnerId)
	}

	errorStr := ""
	for i := range req.Users {
		err := keyDao.DeleteNodeSharedKey(req.NodeId, req.OwnerId, req.Users[i])
		if err != nil {
			errorStr += err.Error() + "\n"
		}
	}
	if len(errorStr) > 0 {
		return errors.InternalServerError(common.SERVICE_ENC_KEY, errorStr)
	}
	return nil
}
