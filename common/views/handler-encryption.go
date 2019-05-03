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

	"github.com/pborman/uuid"

	"github.com/micro/go-micro/errors"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/crypto"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/idm/key"
)

//EncryptionHandler encryption node middleware
type EncryptionHandler struct {
	AbstractHandler
	userKeyTool          key.UserKeyTool
	nodeKeyManagerClient encryption.NodeKeyManagerClient
}

func (e *EncryptionHandler) SetUserKeyTool(keyTool key.UserKeyTool) {
	e.userKeyTool = keyTool
}

func (e *EncryptionHandler) SetNodeKeyManagerClient(nodeKeyManagerClient encryption.NodeKeyManagerClient) {
	e.nodeKeyManagerClient = nodeKeyManagerClient
}

//GetObject enriches request metadata for GetObject with Encryption Materials, if required by datasource.
func (e *EncryptionHandler) GetObject(ctx context.Context, node *tree.Node, requestData *GetRequestData) (io.ReadCloser, error) {
	if strings.HasSuffix(node.Path, common.PYDIO_SYNC_HIDDEN_FILE_META) {
		return e.next.GetObject(ctx, node, requestData)
	}

	branchInfo, ok := GetBranchInfo(ctx, "in")
	if !ok || branchInfo.EncryptionMode != object.EncryptionMode_MASTER {
		return e.next.GetObject(ctx, node, requestData)
	}

	clone := node.Clone()
	log.Logger(ctx).Info("[HANDLER ENCRYPT] > Get Object", zap.String("UUID", node.Uuid), zap.String("Path", node.Path))

	if len(node.Uuid) == 0 || node.Size == 0 {
		rsp, readErr := e.next.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: node,
		})
		if readErr != nil {
			return nil, errors.NotFound("views.Handler.encryption", "failed to get node UUID: %s", readErr)
		}
		clone.Uuid = rsp.Node.Uuid
		clone.Size = rsp.Node.Size
	}

	if len(clone.Uuid) == 0 || clone.Size == 0 {
		return nil, errors.NotFound("views.Handler.encryption", "node Uuid and size are both required")
	}

	dsName := clone.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	if dsName == "" {
		dsName = branchInfo.Root.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	}

	err := clone.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, dsName)
	if err != nil {
		return nil, errors.New("views.encryption.handler", "failed to set node meta data", 500)
	}

	info, offset, length, skipBytesCount, err := e.getNodeInfoForRead(ctx, clone, requestData)
	if err != nil {
		log.Logger(ctx).Error("[HANDLER ENCRYPT] > Failed to get node info", zap.Error(err))
		return nil, err
	}

	if offset == 0 && length == 0 {
		length = -1
	}

	log.Logger(ctx).Info("Received node info:", zap.Any("Content", info), zap.Int64("offset", offset), zap.Int64("count", length))
	rangeRequestData := &GetRequestData{
		StartOffset: offset,
		Length:      length,
		VersionId:   requestData.VersionId,
	}

	keyProtectionTool, err := e.getKeyProtectionTool(ctx)
	if err != nil {
		log.Logger(ctx).Error("[HANDLER ENCRYPT] > Failed to load key tool", zap.Error(err))
		return nil, err
	}

	plainEncryptionKey, err := keyProtectionTool.GetDecrypted(ctx, branchInfo.EncryptionKey, info.NodeKey.KeyData)
	if err != nil {
		log.Logger(ctx).Info("failed to decrypt materials key for user:", zap.String("user", dsName), zap.Error(err))
		return nil, err
	}

	eMat := crypto.NewAESGCMMaterials(plainEncryptionKey, info, nil)

	fullRead := requestData.StartOffset == 0 && (requestData.Length <= 0 || requestData.Length == node.Size)
	if !fullRead {
		eMat.SetPlainRange(skipBytesCount, requestData.Length)
	}

	reader, err := e.next.GetObject(ctx, clone, rangeRequestData)
	if err != nil {
		return nil, err
	}
	return eMat, eMat.SetupDecryptMode(reader)
}

// PutObject enriches request metadata for PutObject with Encryption Materials, if required by datasource.
func (e *EncryptionHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {

	if strings.HasSuffix(node.Path, common.PYDIO_SYNC_HIDDEN_FILE_META) {
		return e.next.PutObject(ctx, node, reader, requestData)
	}

	branchInfo, ok := GetBranchInfo(ctx, "in")
	var err error
	if !ok || branchInfo.EncryptionMode != object.EncryptionMode_MASTER {
		return e.next.PutObject(ctx, node, reader, requestData)
	}

	clone := node.Clone()
	log.Logger(ctx).Debug("[HANDLER ENCRYPT] > Put Object", zap.String("UUID", node.Uuid), zap.String("Path", node.Path))
	if len(clone.Uuid) == 0 {
		rsp, readErr := e.next.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: node,
		})

		if readErr != nil {
			return -1, errors.NotFound("views.Handler.encryption", "failed to get node UUID: %s", readErr)
		}

		if len(rsp.Node.Uuid) == 0 {
			return -1, errors.NotFound("views.Handler.encryption", "failed to get node UUID")
		}
		clone.Uuid = rsp.Node.Uuid
	}

	dsName := clone.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	if dsName == "" {
		_ = clone.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, branchInfo.Name)
	}

	keyProtectionTool, err := e.getKeyProtectionTool(ctx)
	if err != nil {
		return 0, err
	}

	createdNodeInfo := false
	var plainEncryptionKey []byte

	info, err := e.getNodeInfoForWrite(ctx, clone)
	if err != nil {
		pe := errors.Parse(err.Error())
		if pe.Code != 404 {
			log.Logger(ctx).Error("[HANDLER ENCRYPT] > Failed to get node info", zap.Error(err))
			return 0, err
		}

		log.Logger(ctx).Info("[HANDLER ENCRYPT] > New node: creating node info")
		info, err = e.createNodeInfo(ctx, clone)
		if err != nil {
			log.Logger(ctx).Error("[HANDLER ENCRYPT] > Failed to create node info", zap.Error(err))
			return 0, err
		}

		plainEncryptionKey = info.NodeKey.KeyData
		info.NodeKey.KeyData, err = keyProtectionTool.GetEncrypted(ctx, branchInfo.EncryptionKey, plainEncryptionKey)
		if err != nil {
			log.Logger(ctx).Error("[HANDLER ENCRYPT] > Failed to encrypt node key", zap.Error(err))
			return 0, err
		}
		createdNodeInfo = true
	} else {
		plainEncryptionKey, err = keyProtectionTool.GetDecrypted(ctx, branchInfo.EncryptionKey, info.NodeKey.KeyData)
	}

	streamClient, err := e.getNodeKeyManagerClient().SetNodeInfo(ctx)
	if err != nil {
		log.Logger(ctx).Error("[HANDLER ENCRYPT] > Failed to save node encryption info", zap.Error(err))
		return 0, err
	}

	encryptionMaterials := crypto.NewAESGCMMaterials(plainEncryptionKey, info, &setBlockStream{
		client:          streamClient,
		nodeUuid:        clone.Uuid,
		shouldSaveInfo:  createdNodeInfo,
		sentInfoWithKey: false,
		info:            info,
	})
	if err := encryptionMaterials.SetupEncryptMode(reader); err != nil {
		return 0, err
	}

	requestData.Size = -1
	requestData.Md5Sum = nil
	requestData.Sha256Sum = nil
	n, err := e.next.PutObject(ctx, node, encryptionMaterials, requestData)
	return n, err
}

// CopyObject Enriches request metadata for CopyObject with Encryption Materials, if required by datasource
func (e *EncryptionHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {
	srcInfo, ok2 := GetBranchInfo(ctx, "from")
	destInfo, ok := GetBranchInfo(ctx, "to")
	if !ok || !ok2 {
		return 0, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find Client for src or dest")
	}
	readCtx := WithBranchInfo(ctx, "in", srcInfo, true)
	writeCtx := WithBranchInfo(ctx, "in", destInfo, true)
	// Ds are not encrypted, let if flow
	if srcInfo.EncryptionMode != object.EncryptionMode_MASTER && destInfo.EncryptionMode != object.EncryptionMode_MASTER {
		return e.next.CopyObject(ctx, from, to, requestData)
	}
	// Move
	var move, sameClient bool
	if d, ok := requestData.Metadata[common.X_AMZ_META_DIRECTIVE]; ok && d == "COPY" {
		move = true
	}
	sameClient = destInfo.Client == srcInfo.Client
	if move && sameClient {
		return e.next.CopyObject(ctx, from, to, requestData)
	}

	cloneFrom := from.Clone()
	cloneTo := to.Clone()
	if sameClient {
		log.Logger(ctx).Debug("[HANDLER ENCRYPT] > Copy Object Same DS", cloneTo.Zap("from"), zap.String("UUID", from.Uuid), zap.String("Path", from.Path))
		if len(cloneFrom.Uuid) == 0 {
			rsp, readErr := e.next.ReadNode(readCtx, &tree.ReadNodeRequest{
				Node: from,
			})
			if readErr != nil {
				return -1, errors.NotFound("views.Handler.encryption", "failed to get node UUID: %s", readErr)
			}
			if len(rsp.Node.Uuid) == 0 {
				return -1, errors.NotFound("views.Handler.encryption", "failed to get node UUID")
			}
			cloneFrom.Uuid = rsp.Node.Uuid
		}
		// Force target Uuid to copy encryption material
		cloneTo.Uuid = uuid.New()
		// Just add the metadata and let underlying handler do the job
		requestData.Metadata[common.X_AMZ_META_NODE_UUID] = cloneTo.Uuid
		requestData.Metadata[common.X_AMZ_META_CLEAR_SIZE] = fmt.Sprintf("%d", cloneFrom.Size)
		l, er := e.next.CopyObject(ctx, from, to, requestData)
		if er == nil {
			err := e.copyEncryptionMaterials(ctx, cloneFrom, cloneTo)
			if err == nil {
				er = err
			}
		}
		return l, er
	} else {
		// We have to encrypt/decrypt on the fly
		destPath := cloneTo.ZapPath()
		rsp, readErr := e.next.ReadNode(readCtx, &tree.ReadNodeRequest{
			Node: cloneFrom,
		})
		if readErr != nil {
			return 0, readErr
		} else if rsp.Node == nil {
			return 0, fmt.Errorf("empty node returned")
		}
		cloneFrom = rsp.Node
		reader, err := e.GetObject(readCtx, cloneFrom, &GetRequestData{StartOffset: 0, Length: cloneFrom.Size})
		if err != nil {
			log.Logger(ctx).Error("HandlerEncryption: CopyObject / Different Clients - Read Source Error", zap.Any("srcInfo", srcInfo), cloneFrom.Zap("readFrom"), zap.Error(err))
			return 0, err
		}
		defer reader.Close()
		log.Logger(ctx).Debug("HandlerEncryption: copy one DS to another - force UUID", cloneTo.Zap("to"), zap.Any("srcInfo", srcInfo), zap.Any("destInfo", destInfo))
		if !move {
			cloneTo.Uuid = uuid.New()
		} else {
			cloneTo.Uuid = cloneFrom.Uuid
		}
		putReqData := &PutRequestData{
			Size:     -1,
			Metadata: requestData.Metadata,
		}
		putReqData.Metadata[common.X_AMZ_META_CLEAR_SIZE] = fmt.Sprintf("%d", cloneFrom.Size)
		putReqData.Metadata[common.X_AMZ_META_NODE_UUID] = cloneTo.Uuid
		oi, err := e.PutObject(writeCtx, cloneTo, reader, putReqData)
		if err != nil {
			log.Logger(ctx).Error("HandlerEncryption: CopyObject / Different Clients",
				zap.Error(err),
				cloneFrom.Zap("from"),
				cloneTo.Zap("to"),
				zap.Any("srcInfo", srcInfo),
				zap.Any("destInfo", destInfo),
				zap.Any("targetPath", destPath))
		} else {
			log.Logger(ctx).Debug("HandlerEncryption: CopyObject / Different Clients", rsp.Node.Zap("from"), zap.Int64("written", oi))
		}
		return oi, err
	}

}

func (e *EncryptionHandler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *PutRequestData) (minio.ObjectPart, error) {
	var err error
	branchInfo, ok := GetBranchInfo(ctx, "in")
	if !ok || branchInfo.EncryptionMode != object.EncryptionMode_MASTER {
		return e.next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
	}

	clone := target.Clone()
	if len(clone.Uuid) == 0 {
		rsp, readErr := e.next.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: target,
		})

		if readErr != nil {
			return minio.ObjectPart{}, errors.NotFound("views.Handler.encryption", "failed to get node UUID: %s", readErr)
		}

		if len(rsp.Node.Uuid) == 0 {
			return minio.ObjectPart{}, errors.NotFound("views.Handler.encryption", "failed to get node UUID")
		}
		clone.Uuid = rsp.Node.Uuid
	}

	log.Logger(ctx).Debug("[HANDLER ENCRYPT] > Put Multi Part Object", zap.String("UUID", clone.Uuid), zap.String("Path", clone.Path))

	dsName := clone.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	if dsName == "" {
		_ = clone.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, branchInfo.Name)
	}

	keyProtectionTool, err := e.getKeyProtectionTool(ctx)
	if err != nil {
		return minio.ObjectPart{}, err
	}

	createdNodeInfo := false
	var plainEncryptionKey []byte

	info, err := e.getNodeInfoForWrite(ctx, clone)
	if err != nil {
		pe := errors.Parse(err.Error())
		if pe.Code != 404 {
			log.Logger(ctx).Error("[HANDLER ENCRYPT] > Failed to get Multi Part  node info", zap.Error(err))
			return minio.ObjectPart{}, err
		}

		log.Logger(ctx).Info("[HANDLER ENCRYPT] > New node: creating node info")
		info, err = e.createNodeInfo(ctx, clone)
		if err != nil {
			log.Logger(ctx).Error("[HANDLER ENCRYPT] > Failed to create Multi Part  node info", zap.Error(err))
			return minio.ObjectPart{}, err
		}

		plainEncryptionKey = info.NodeKey.KeyData
		info.NodeKey.KeyData, err = keyProtectionTool.GetEncrypted(ctx, branchInfo.EncryptionKey, plainEncryptionKey)
		if err != nil {
			log.Logger(ctx).Error("[HANDLER ENCRYPT] > Failed to encrypt Multi Part  node key", zap.Error(err))
			return minio.ObjectPart{}, err
		}
		createdNodeInfo = true
	} else {
		plainEncryptionKey, err = keyProtectionTool.GetDecrypted(ctx, branchInfo.EncryptionKey, info.NodeKey.KeyData)
	}

	streamClient, err := e.getNodeKeyManagerClient().SetNodeInfo(ctx)
	if err != nil {
		log.Logger(ctx).Error("[HANDLER ENCRYPT] > Failed to save Multi Part node encryption info", zap.Error(err))
		return minio.ObjectPart{}, err
	}

	encryptionMaterials := crypto.NewAESGCMMaterials(plainEncryptionKey, info, &setBlockStream{
		client:          streamClient,
		nodeUuid:        clone.Uuid,
		shouldSaveInfo:  createdNodeInfo,
		sentInfoWithKey: false,
		info:            info,
		partId:          uint32(partNumberMarker),
	})
	if err := encryptionMaterials.SetupEncryptMode(reader); err != nil {
		return minio.ObjectPart{}, err
	}

	requestData.Size = -1
	requestData.Md5Sum = nil
	requestData.Sha256Sum = nil
	return e.next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, encryptionMaterials, requestData)

}

func (e *EncryptionHandler) copyEncryptionMaterials(ctx context.Context, source *tree.Node, copy *tree.Node) error {
	//does not handle cross-copy if ever exists somewhere in pydio
	/*dsName := source.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	var wsUser = fmt.Sprintf("ds:%s", dsName)

	nodeKey, err := e.getNodeEncryptionKey(ctx, wsUser, source.Uuid)
	if err != nil {
		return err
	}

	copyNodeKey := &encryption.NodeKey{
		BlockSize: nodeKey.BlockSize,
		Payload:      nodeKey.Payload,
		NodeId:    copy.Uuid,
		Nonce:     nodeKey.Nonce,
		OwnerId:   wsUser,
		UserId:    wsUser,
	}
	return e.setNodeEncryptionKey(ctx, copyNodeKey)*/
	// TODO handle that
	return nil
}

func (e *EncryptionHandler) getNodeInfoForRead(ctx context.Context, node *tree.Node, requestData *GetRequestData) (*encryption.NodeInfo, int64, int64, int64, error) {
	nodeEncryptionClient := e.nodeKeyManagerClient
	if nodeEncryptionClient == nil {
		nodeEncryptionClient = encryption.NewNodeKeyManagerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ENC_KEY, defaults.NewClient())
	}

	fullRead := requestData.StartOffset == 0 && (requestData.Length <= 0 || requestData.Length == node.Size)
	if !fullRead {
		log.Logger(ctx).Info("sending GetNodeInfoRequest with range", zap.Int64("Offset", requestData.StartOffset), zap.Int64("Length", requestData.Length))
	}
	dsName := node.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	rsp, err := nodeEncryptionClient.GetNodeInfo(ctx, &encryption.GetNodeInfoRequest{
		UserId:      fmt.Sprintf("ds:%s", dsName),
		NodeId:      node.Uuid,
		WithRange:   !fullRead,
		PlainOffset: requestData.StartOffset,
		PlainLength: requestData.Length,
	})
	if err != nil {
		return nil, 0, 0, 0, err
	}
	if !fullRead {
		log.Logger(ctx).Info("Received GetNodeInfoResponse with range", zap.Int64("Offset", rsp.EncryptedOffset), zap.Int64("Length", rsp.EncryptedCount))
	}
	return rsp.NodeInfo, int64(rsp.EncryptedOffset), int64(rsp.EncryptedCount), rsp.HeadSKippedPlainBytesCount, nil
}

func (e *EncryptionHandler) getNodeInfoForWrite(ctx context.Context, node *tree.Node) (*encryption.NodeInfo, error) {
	nodeEncryptionClient := e.nodeKeyManagerClient
	if nodeEncryptionClient == nil {
		nodeEncryptionClient = encryption.NewNodeKeyManagerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ENC_KEY, defaults.NewClient())
	}

	dsName := node.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	rsp, err := nodeEncryptionClient.GetNodeInfo(ctx, &encryption.GetNodeInfoRequest{
		UserId:    fmt.Sprintf("ds:%s", dsName),
		NodeId:    node.Uuid,
		WithRange: false,
	})
	if err != nil {
		return nil, err
	}
	return rsp.NodeInfo, nil
}

func (e *EncryptionHandler) getNodeInfo(ctx context.Context, request *encryption.GetNodeInfoRequest) (*encryption.GetNodeInfoResponse, error) {
	nodeEncryptionClient := e.nodeKeyManagerClient
	if nodeEncryptionClient == nil {
		nodeEncryptionClient = encryption.NewNodeKeyManagerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ENC_KEY, defaults.NewClient())
	}
	return nodeEncryptionClient.GetNodeInfo(ctx, request)
}

func (e *EncryptionHandler) createNodeInfo(ctx context.Context, node *tree.Node) (*encryption.NodeInfo, error) {
	dsName := node.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	user := fmt.Sprintf("ds:%s", dsName)
	info := new(encryption.NodeInfo)

	//we generate a new key
	info.NodeKey = &encryption.NodeKey{
		UserId:  user,
		NodeId:  node.Uuid,
		OwnerId: user,
	}

	encKey, _ := crypto.RandomBytes(32)
	info.NodeKey.KeyData = encKey

	info.Node = new(encryption.Node)
	info.Node.Legacy = false
	info.Node.NodeId = node.Uuid

	return info, nil
}

func (e *EncryptionHandler) getKeyProtectionTool(ctx context.Context) (key.UserKeyTool, error) {
	tool := e.userKeyTool
	var err error
	if tool == nil {
		tool, err = key.MasterKeyTool(ctx)
		if err != nil {
			return nil, err
		}
	}
	return tool, err
}

func (e *EncryptionHandler) getNodeKeyManagerClient() encryption.NodeKeyManagerClient {
	nodeEncryptionClient := e.nodeKeyManagerClient
	if nodeEncryptionClient == nil {
		nodeEncryptionClient = encryption.NewNodeKeyManagerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ENC_KEY, defaults.NewClient())
	}
	return nodeEncryptionClient
}

// setBlockStream
type setBlockStream struct {
	client          encryption.NodeKeyManager_SetNodeInfoClient
	info            *encryption.NodeInfo
	sentInfoWithKey bool
	shouldSaveInfo  bool
	nodeUuid        string
	position        uint32
	partId          uint32
}

func (streamer *setBlockStream) Handle(block *encryption.Block) error {
	streamer.position++
	block.Position = streamer.position
	block.PartId = streamer.partId

	setNodeInfoRequest := &encryption.SetNodeInfoRequest{
		Block:  block,
		NodeId: streamer.nodeUuid,
	}

	if streamer.shouldSaveInfo && !streamer.sentInfoWithKey {
		streamer.sentInfoWithKey = true
		setNodeInfoRequest.NodeKey = streamer.info.NodeKey
	}

	err := streamer.client.SendMsg(setNodeInfoRequest)
	if err != nil {
		if err == io.EOF {
			return nil
		}
		log.Logger(context.Background()).Error("[HANDLER ENCRYPT] > Failed to save node block info", zap.Error(err))
		return err
	}

	var rsp encryption.SetNodeInfoResponse
	return streamer.client.RecvMsg(&rsp)
}

func (streamer *setBlockStream) Close() error {
	// send empty node to notify the end of the exchange
	_ = streamer.client.SendMsg(&encryption.SetNodeInfoRequest{})
	return streamer.client.Close()
}
