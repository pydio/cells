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

package views

import (
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/micro/go-micro/errors"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/crypto"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/idm/key"
)

//EncryptionHandler encryption node middleware
type EncryptionHandler struct {
	AbstractHandler
}

//GetObject Enriches request metadata for GetObject with Encryption Materials, if required by datasource
func (e *EncryptionHandler) GetObject(ctx context.Context, node *tree.Node, requestData *GetRequestData) (io.ReadCloser, error) {

	if strings.HasSuffix(node.Path, common.PYDIO_SYNC_HIDDEN_FILE_META) {
		return e.next.GetObject(ctx, node, requestData)
	}

	info, ok := GetBranchInfo(ctx, "in")
	if ok && info.EncryptionMode == object.EncryptionMode_MASTER {
		clone := node.Clone()
		log.Logger(ctx).Debug("[HANDLER ENCRYPT] > Get Object", zap.String("UUID", node.Uuid), zap.String("Path", node.Path))

		if len(node.Uuid) == 0 || node.Size == 0 {
			rsp, readErr := e.next.ReadNode(ctx, &tree.ReadNodeRequest{
				Node: node,
			})
			if readErr != nil {
				return nil, errors.NotFound("views.Handler.encryption", "failed to get node UUID", readErr)
			}
			clone.Uuid = rsp.Node.Uuid
			clone.Size = rsp.Node.Size
		}

		if len(clone.Uuid) == 0 || clone.Size == 0 {
			return nil, errors.NotFound("views.Handler.encryption", "node Uuid and size are bith required")
		}

		dsName := clone.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
		if dsName == "" {
			dsName = info.Root.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
		}

		requestData.Length = -1

		clone.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, dsName)
		var err error
		eMat, err := e.retrieveEncryptionMaterials(ctx, clone, info.EncryptionKey)
		if err != nil {
			return nil, err
		}
		reader, err := e.next.GetObject(ctx, clone, requestData)
		if err != nil {
			return nil, err
		}
		err = eMat.SetupDecryptMode(reader, eMat.GetIV(), eMat.GetKey())
		if err != nil {
			return nil, err
		}
		return eMat, nil
	}

	return e.next.GetObject(ctx, node, requestData)
}

// PutObject Enriches request metadata for PutObject with Encryption Materials, if required by datasource
func (e *EncryptionHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {

	if strings.HasSuffix(node.Path, common.PYDIO_SYNC_HIDDEN_FILE_META) {
		return e.next.PutObject(ctx, node, reader, requestData)
	}

	info, ok := GetBranchInfo(ctx, "in")
	var err error
	if !ok || info.EncryptionMode != object.EncryptionMode_MASTER {
		return e.next.PutObject(ctx, node, reader, requestData)
	}

	clone := node.Clone()
	log.Logger(ctx).Debug("[HANDLER ENCRYPT] > Put Object", zap.String("UUID", node.Uuid), zap.String("Path", node.Path))
	if len(clone.Uuid) == 0 {
		rsp, readErr := e.next.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: node,
		})

		if readErr != nil {
			return -1, errors.NotFound("views.Handler.encryption", "failed to get node UUID", readErr)
		}

		if len(rsp.Node.Uuid) == 0 {
			return -1, errors.NotFound("views.Handler.encryption", "failed to get node UUID")
		}
		clone.Uuid = rsp.Node.Uuid
	}

	dsName := clone.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	if dsName == "" {
		dsName = info.Root.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	}

	clone.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, dsName)

	eMaterial, err := e.retrieveEncryptionMaterials(ctx, clone, info.EncryptionKey)
	if err != nil {
		return 0, err
	}

	if err := eMaterial.SetupEncryptMode(reader); err != nil {
		return 0, err
	} else {
		// Clear input
		requestData.Size = -1
		requestData.Md5Sum = nil
		requestData.Sha256Sum = nil
	}
	reader = eMaterial

	n, err := e.next.PutObject(ctx, node, reader, requestData)
	if err != nil {
		log.Logger(ctx).Error("PutObject failed", zap.Error(err))
	} else if eMaterial != nil {
		params := eMaterial.GetEncryptedParameters()
		err = e.setNodeEncryptionParams(ctx, node, params)
	}
	return n, err
}

// CopyObject Enriches request metadata for CopyObject with Encryption Materials, if required by datasource
func (e *EncryptionHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok || info.EncryptionMode != object.EncryptionMode_MASTER {
		return e.next.CopyObject(ctx, from, to, requestData)
	}

	cloneFrom := from.Clone()
	cloneTo := to.Clone()
	log.Logger(ctx).Debug("[HANDLER ENCRYPT] > Copy Object", zap.String("UUID", from.Uuid), zap.String("Path", from.Path))
	if len(cloneFrom.Uuid) == 0 {

		rsp, readErr := e.next.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: from,
		})

		if readErr != nil {
			return -1, errors.NotFound("views.Handler.encryption", "failed to get node UUID", readErr)
		}

		if len(rsp.Node.Uuid) == 0 {
			return -1, errors.NotFound("views.Handler.encryption", "failed to get node UUID")
		}

		cloneFrom.Uuid = rsp.Node.Uuid
	}

	dsName := cloneFrom.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	if dsName == "" {
		dsName = info.Root.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	}

	cloneFrom.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, dsName)
	cloneTo.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, dsName)
	err := e.copyEncryptionMaterials(ctx, from, to)
	if err != nil {
		return 0, err
	}

	return e.next.CopyObject(ctx, from, to, requestData)
}

func (e *EncryptionHandler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *PutRequestData) (minio.ObjectPart, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if ok && info.EncryptionMode == object.EncryptionMode_MASTER {
		return minio.ObjectPart{}, errors.BadRequest("handler.encryption.putObjectPart", "Encryption is not supported for multipart uploads")
	}
	return e.next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

func (e *EncryptionHandler) setNodeEncryptionKey(ctx context.Context, nodeKey *encryption.NodeKey) error {
	nodeKeyClient := encryption.NewNodeKeyManagerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ENC_KEY, defaults.NewClient())
	_, err := nodeKeyClient.SetNodeKey(ctx, &encryption.SetNodeKeyRequest{
		Key: nodeKey,
	})
	return err
}

func (e *EncryptionHandler) getNodeEncryptionKey(ctx context.Context, userID string, nodeUUID string) (*encryption.NodeKey, error) {
	nodeKeyClient := encryption.NewNodeKeyManagerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ENC_KEY, defaults.NewClient())
	rsp, err := nodeKeyClient.GetNodeKey(ctx, &encryption.GetNodeKeyRequest{
		UserId: userID,
		NodeId: nodeUUID,
	})
	if err != nil {
		return nil, err
	}
	return &encryption.NodeKey{
		OwnerId:   rsp.OwnerId,
		Data:      rsp.EncryptedKey,
		BlockSize: rsp.BlockSize,
		Nonce:     rsp.Nonce,
	}, nil
}

func (e *EncryptionHandler) setNodeEncryptionParams(ctx context.Context, node *tree.Node, params *encryption.Params) error {
	nodeKeyClient := encryption.NewNodeKeyManagerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ENC_KEY, defaults.NewClient())
	_, err := nodeKeyClient.SetNodeParams(ctx, &encryption.SetNodeParamsRequest{
		NodeId: node.Uuid,
		Params: params,
	})
	return err
}

func (e *EncryptionHandler) retrieveEncryptionMaterials(ctx context.Context, node *tree.Node, encryptionKeyName string) (*crypto.AESGCMMaterials, error) {

	dsName := node.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	tool, err := key.MasterKeyTool(ctx)
	if err != nil {
		return nil, err
	}

	var wsUser = fmt.Sprintf("ds:%s", dsName)
	nodeKey, err := e.getNodeEncryptionKey(ctx, wsUser, node.Uuid)
	if err != nil {
		return nil, err
	}

	if nodeKey.Data == nil || len(nodeKey.Data) == 0 {
		//if not found

		//we generate a new key
		encKey, err := crypto.RandomBytes(32)
		if err != nil {
			return nil, err
		}

		//we seal the key with the ws tool
		sealedKey, err := tool.GetEncrypted(ctx, encryptionKeyName, encKey)
		if err != nil {
			return nil, err
		}

		//we tell the data-key service to associate the sealed key to wsUser<->node
		err = e.setNodeEncryptionKey(ctx, &encryption.NodeKey{
			UserId:    wsUser,
			NodeId:    node.Uuid,
			OwnerId:   wsUser,
			Data:      sealedKey,
			Nonce:     nil,
			BlockSize: 0,
		})
		if err != nil {
			return nil, err
		}

		return crypto.NewAESGCMMaterials(encKey, nil), nil

	}
	encKey, err := tool.GetDecrypted(ctx, encryptionKeyName, nodeKey.Data)
	if err != nil {
		return nil, err
	}

	return crypto.NewAESGCMMaterials(encKey, &encryption.Params{
		BlockSize: nodeKey.BlockSize,
		Nonce:     nodeKey.Nonce,
	}), nil
}

func (e *EncryptionHandler) copyEncryptionMaterials(ctx context.Context, source *tree.Node, copy *tree.Node) error {
	//does not handle cross-copy if ever exists somewhere in pydio
	dsName := source.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	var wsUser = fmt.Sprintf("ds:%s", dsName)

	nodeKey, err := e.getNodeEncryptionKey(ctx, wsUser, source.Uuid)
	if err != nil {
		return err
	}

	copyNodeKey := &encryption.NodeKey{
		BlockSize: nodeKey.BlockSize,
		Data:      nodeKey.Data,
		NodeId:    copy.Uuid,
		Nonce:     nodeKey.Nonce,
		OwnerId:   wsUser,
		UserId:    wsUser,
	}
	return e.setNodeEncryptionKey(ctx, copyNodeKey)
}
