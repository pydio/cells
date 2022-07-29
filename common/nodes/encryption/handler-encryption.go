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

package encryption

import (
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/pydio/cells/v4/common/client/grpc"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/errors"
)

func WithEncryption() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, &Handler{})
	}
}

//Handler encryption node middleware
type Handler struct {
	abstract.Handler
	userKeyTool          UserKeyTool
	nodeKeyManagerClient encryption.NodeKeyManagerClient
}

func (e *Handler) Adapt(h nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	e.AdaptOptions(h, options)
	return e
}

func (e *Handler) SetUserKeyTool(keyTool UserKeyTool) {
	e.userKeyTool = keyTool
}

func (e *Handler) SetNodeKeyManagerClient(nodeKeyManagerClient encryption.NodeKeyManagerClient) {
	e.nodeKeyManagerClient = nodeKeyManagerClient
}

//GetObject enriches request metadata for GetObject with Encryption Materials, if required by the datasource.
func (e *Handler) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	if strings.HasSuffix(node.Path, common.PydioSyncHiddenFile) {
		return e.Next.GetObject(ctx, node, requestData)
	}

	branchInfo, ok := nodes.GetBranchInfo(ctx, "in")
	if !ok || branchInfo.EncryptionMode != object.EncryptionMode_MASTER {
		return e.Next.GetObject(ctx, node, requestData)
	}

	clone := node.Clone()

	if len(node.Uuid) == 0 || node.Size == 0 {
		rsp, readErr := e.Next.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: node,
		})
		if readErr != nil {
			return nil, errors.NotFound("views.Handler.encryption", "failed to get node UUID: %s", readErr)
		}
		clone.Uuid = rsp.Node.Uuid
		clone.Size = rsp.Node.Size
	}

	if len(clone.Uuid) == 0 || clone.Size == 0 {
		return nil, errors.NotFound("views.handler.encryption.GetObject", "node Uuid and size are both required")
	}

	dsName := clone.GetStringMeta(common.MetaNamespaceDatasourceName)
	if dsName == "" {
		if branchInfo.Root != nil {
			dsName = branchInfo.Root.GetStringMeta(common.MetaNamespaceDatasourceName)
		} else if branchInfo.DataSource != nil && branchInfo.Name != "" {
			dsName = branchInfo.Name
		} else {
			return nil, errors.New("views.handler.encryption.GetObject", "cannot find datasource name", 500)
		}
		clone.MustSetMeta(common.MetaNamespaceDatasourceName, dsName)
	}

	info, offset, length, skipBytesCount, err := e.getNodeInfoForRead(ctx, clone, requestData)
	if err != nil {
		log.Logger(ctx).Error("views.handler.encryption.GetObject: failed to get node info", zap.Error(err))
		return nil, err
	}

	if offset == 0 && length == 0 {
		length = -1
	}

	keyProtectionTool, err := e.getKeyProtectionTool(ctx)
	if err != nil {
		log.Logger(ctx).Error("views.handler.encryption.GetObject: failed to load key tool", zap.Error(err))
		return nil, err
	}

	plainKey, err := keyProtectionTool.GetDecrypted(ctx, branchInfo.EncryptionKey, info.NodeKey.KeyData)
	if err != nil {
		log.Logger(ctx).Error("views.handler.encryption.GetObject: failed to decrypt materials key", zap.String("user", dsName), zap.Error(err))
		return nil, err
	}

	boundariesOk := requestData.StartOffset >= 0 && requestData.StartOffset <= clone.Size
	boundariesOk = boundariesOk && (requestData.Length == -1 || requestData.Length > 0 && requestData.StartOffset+requestData.Length <= clone.Size)

	if !boundariesOk {
		return nil, errors.New("views.handler.encryption.GetObject", "wrong range", 400)
	}

	fullRead := requestData.StartOffset == 0 && (requestData.Length <= 0 || requestData.Length == clone.Size)
	if requestData.Length <= 0 {
		requestData.Length = clone.Size
	}

	if info.Node.Legacy {
		eMat := crypto.NewLegacyAESGCMMaterials(info)
		rangeRequestData := &models.GetRequestData{VersionId: requestData.VersionId, StartOffset: 0, Length: -1}
		if !fullRead {
			err = eMat.SetPlainRange(requestData.StartOffset, requestData.Length)
			if err != nil {
				return nil, err
			}
			rangeRequestData.StartOffset, rangeRequestData.Length = eMat.CalculateEncryptedRange(clone.Size)
		}

		reader, err := e.Next.GetObject(ctx, clone, rangeRequestData)
		if err != nil {
			return nil, err
		}
		return eMat, eMat.SetupDecryptMode(plainKey, reader)

	} else {
		eMat := crypto.NewAESGCMMaterials(info, nil)
		if !fullRead {
			eMat.SetPlainRange(skipBytesCount, requestData.Length)
		}
		rangeRequestData := &models.GetRequestData{
			StartOffset: offset,
			Length:      length,
			VersionId:   requestData.VersionId,
		}
		reader, err := e.Next.GetObject(ctx, clone, rangeRequestData)
		if err != nil {
			return nil, err
		}
		return eMat, eMat.SetupDecryptMode(plainKey, reader)
	}
}

// PutObject enriches request metadata for PutObject with Encryption Materials, if required by datasource.
func (e *Handler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	if strings.HasSuffix(node.Path, common.PydioSyncHiddenFile) {
		return e.Next.PutObject(ctx, node, reader, requestData)
	}

	branchInfo, ok := nodes.GetBranchInfo(ctx, "in")
	var err error
	if !ok || branchInfo.EncryptionMode != object.EncryptionMode_MASTER {
		return e.Next.PutObject(ctx, node, reader, requestData)
	}

	clone := node.Clone()
	if len(clone.Uuid) == 0 {
		rsp, readErr := e.Next.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: node,
		})

		if readErr != nil {
			return models.ObjectInfo{}, errors.NotFound("views.handler.encryption.PutObject", "failed to get node UUID: %s", readErr)
		}

		if len(rsp.Node.Uuid) == 0 {
			return models.ObjectInfo{}, errors.NotFound("views.handler.encryption.PutObject", "failed to get node UUID")
		}
		clone.Uuid = rsp.Node.Uuid
	}

	dsName := clone.GetStringMeta(common.MetaNamespaceDatasourceName)
	if dsName == "" {
		clone.MustSetMeta(common.MetaNamespaceDatasourceName, branchInfo.Name)
	}

	keyProtectionTool, err := e.getKeyProtectionTool(ctx)
	if err != nil {
		return models.ObjectInfo{}, err
	}

	ct, ca := context.WithCancel(ctx)
	defer ca()
	streamClient, err := e.getNodeKeyManagerClient().SetNodeInfo(ct)
	if err != nil {
		log.Logger(ctx).Error("views.handler.encryption.PutObject: failed to save node encryption info", zap.Error(err))
		return models.ObjectInfo{}, err
	}
	streamer := &setBlockStream{
		client:   streamClient,
		nodeUuid: clone.Uuid,
		keySent:  false,
		ctx:      ctx,
	}

	var encryptionKeyPlainBytes []byte

	info, err := e.getNodeInfoForWrite(ctx, clone)
	if err != nil {
		if errors.FromError(err).Code != 404 {
			return models.ObjectInfo{}, err
		}

		info, err = e.createNodeInfo(ctx, clone)
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.PutObject: failed to create node info", zap.Error(err))
			return models.ObjectInfo{}, err
		}

		encryptionKeyPlainBytes = info.NodeKey.KeyData
		info.NodeKey.KeyData, err = keyProtectionTool.GetEncrypted(ctx, branchInfo.EncryptionKey, info.NodeKey.KeyData)
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.PutObject: failed to encrypt node key", zap.Error(err))
			return models.ObjectInfo{}, err
		}

		err = streamer.SendKey(info.NodeKey)
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.PutObject: failed to set nodeKey", zap.Error(err))
			return models.ObjectInfo{}, err
		}

	} else {
		encryptionKeyPlainBytes, err = keyProtectionTool.GetDecrypted(ctx, branchInfo.EncryptionKey, info.NodeKey.KeyData)
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.PutObject: failed to decrypt key", zap.Error(err))
			return models.ObjectInfo{}, err
		}

		err = streamer.ClearBlocks(clone.Uuid)
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.PutObject: failed to clear old blocks", zap.Error(err))
			return models.ObjectInfo{}, err
		}

	}

	encryptionMaterials := crypto.NewAESGCMMaterials(info, streamer)
	if err := encryptionMaterials.SetupEncryptMode(encryptionKeyPlainBytes, reader); err != nil {
		return models.ObjectInfo{}, err
	}

	requestData.Md5Sum = nil
	requestData.Sha256Sum = nil
	// Update Size : set Plain as Meta and Encrypted as Size.
	if requestData.Metadata == nil {
		requestData.Metadata = make(map[string]string, 1)
	}
	if requestData.Size > -1 {
		log.Logger(ctx).Debug("Adding special header to store clear size", zap.Any("s", requestData.Size))
		requestData.Metadata[common.XAmzMetaClearSize] = fmt.Sprintf("%d", requestData.Size)
	} else {
		requestData.Metadata[common.XAmzMetaClearSize] = common.XAmzMetaClearSizeUnkown
	}
	requestData.Size = encryptionMaterials.CalculateOutputSize(requestData.Size, info.NodeKey.OwnerId)

	n, err := e.Next.PutObject(ctx, node, encryptionMaterials, requestData)
	return n, err
}

// CopyObject enriches request metadata for CopyObject with Encryption Materials, if required by the datasource
func (e *Handler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	srcInfo, ok2 := nodes.GetBranchInfo(ctx, "from")
	destInfo, ok := nodes.GetBranchInfo(ctx, "to")
	if !ok || !ok2 {
		return models.ObjectInfo{}, errors.InternalServerError("views.handler.encryption.CopyObject", "Cannot find Handler for src or dest")
	}
	readCtx := nodes.WithBranchInfo(ctx, "in", srcInfo, true)
	writeCtx := nodes.WithBranchInfo(ctx, "in", destInfo, true)
	// Ds are not encrypted, let if flow
	if srcInfo.EncryptionMode != object.EncryptionMode_MASTER && destInfo.EncryptionMode != object.EncryptionMode_MASTER {
		return e.Next.CopyObject(ctx, from, to, requestData)
	}
	if requestData.Metadata == nil {
		requestData.Metadata = map[string]string{}
	}
	// Move
	var move, sameClient bool
	if d, ok := requestData.Metadata[common.XAmzMetaDirective]; ok && d == "COPY" {
		move = true
	}
	sameClient = destInfo.Client == srcInfo.Client
	if move && sameClient {
		return e.Next.CopyObject(ctx, from, to, requestData)
	}

	cloneFrom := from.Clone()
	cloneTo := to.Clone()
	if sameClient {
		if len(cloneFrom.Uuid) == 0 {
			rsp, readErr := e.Next.ReadNode(readCtx, &tree.ReadNodeRequest{
				Node: from,
			})
			if readErr != nil {
				return models.ObjectInfo{}, errors.NotFound("views.handler.encryption.CopyObject", "failed to get node UUID: %s", readErr)
			}
			if len(rsp.Node.Uuid) == 0 {
				return models.ObjectInfo{}, errors.NotFound("views.handler.encryption.CopyObject", "failed to get node UUID")
			}
			cloneFrom.Uuid = rsp.Node.Uuid
		}
		// Force target Uuid to copy encryption material
		cloneTo.RenewUuidIfEmpty(cloneTo.Uuid == cloneFrom.Uuid)

		// Just add the metadata and let underlying handler do the job
		requestData.Metadata[common.XAmzMetaNodeUuid] = cloneTo.Uuid
		requestData.Metadata[common.XAmzMetaClearSize] = fmt.Sprintf("%d", cloneFrom.Size)
		l, er := e.Next.CopyObject(ctx, from, to, requestData)
		if er == nil {
			if err := e.copyNodeEncryptionData(ctx, cloneFrom, cloneTo); err != nil {
				return l, err
			}
		}
		return l, er
	} else {
		// We have to encrypt/decrypt on the fly
		destPath := cloneTo.ZapPath()
		if cloneFrom.Uuid == "" || cloneFrom.Size == 0 {
			rsp, readErr := e.Next.ReadNode(readCtx, &tree.ReadNodeRequest{
				Node: cloneFrom,
			})
			if readErr != nil {
				return models.ObjectInfo{}, readErr
			} else if rsp.Node == nil {
				return models.ObjectInfo{}, errors.NotFound("views.handler.encryption.CopyObject", "no node found that matches %s", cloneFrom)
			}
			cloneFrom = rsp.Node
		}
		reader, err := e.GetObject(readCtx, cloneFrom, &models.GetRequestData{StartOffset: 0, Length: cloneFrom.Size})
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.CopyObject: Different Clients - Read Source Error", zap.Any("srcInfo", srcInfo), cloneFrom.Zap("readFrom"), zap.Error(err))
			return models.ObjectInfo{}, err
		}
		defer reader.Close()
		log.Logger(ctx).Debug("views.handler.encryption.CopyObject: from one DS to another - force UUID", cloneTo.Zap("to"), zap.Any("srcInfo", srcInfo), zap.Any("destInfo", destInfo))
		if !move {
			cloneTo.RenewUuidIfEmpty(cloneTo.GetUuid() == cloneFrom.GetUuid())
		} else {
			cloneTo.Uuid = cloneFrom.GetUuid()
		}
		if destInfo.FlatStorage {
			// Insert in tree as temporary
			cloneTo.Type = tree.NodeType_LEAF
			cloneTo.Etag = common.NodeFlagEtagTemporary
			if _, er := e.ClientsPool.GetTreeClientWrite().CreateNode(writeCtx, &tree.CreateNodeRequest{Node: cloneTo}); er != nil {
				return models.ObjectInfo{}, er
			}
		}
		putReqData := &models.PutRequestData{
			Size:     cloneFrom.Size,
			Metadata: requestData.Metadata,
		}
		putReqData.Metadata[common.XAmzMetaClearSize] = fmt.Sprintf("%d", cloneFrom.Size)
		putReqData.Metadata[common.XAmzMetaNodeUuid] = cloneTo.Uuid
		oi, err := e.PutObject(writeCtx, cloneTo, reader, putReqData)
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.CopyObject: Different Clients",
				zap.Error(err),
				cloneFrom.Zap("from"),
				cloneTo.Zap("to"),
				zap.Any("srcInfo", srcInfo),
				zap.Any("destInfo", destInfo),
				zap.Any("targetPath", destPath))
		} else {
			log.Logger(ctx).Debug("views.handler.encryption.CopyObject: Different Clients", cloneFrom.Zap("from"), zap.Int64("written", oi.Size))
		}
		return oi, err
	}
}

func (e *Handler) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	var err error
	branchInfo, ok := nodes.GetBranchInfo(ctx, "in")
	if !ok || branchInfo.EncryptionMode != object.EncryptionMode_MASTER {
		// Not necessary for non-encrypted data source
		delete(requestData.Metadata, common.XAmzMetaClearSize)
		return e.Next.MultipartCreate(ctx, target, requestData)
	}

	if _, ok := requestData.Metadata[common.XAmzMetaClearSize]; !ok {
		log.Logger(ctx).Warn("views.handler.encryption.MultiPartCreate: Missing special header to store clear size when uploading on encrypted data source - Setting ClearSize as unknown")
		requestData.Metadata[common.XAmzMetaClearSize] = common.XAmzMetaClearSizeUnkown
	}

	clone := target.Clone()
	if len(clone.Uuid) == 0 {
		rsp, readErr := e.Next.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: target,
		})

		if readErr != nil {
			return "", errors.NotFound("views.handler.encryption.MultiPartCreate", "failed to get node UUID: %s", readErr)
		}

		if len(rsp.Node.Uuid) == 0 {
			return "", errors.NotFound("views.handler.encryption.MultiPartCreate", "failed to get node UUID")
		}
		clone.Uuid = rsp.Node.Uuid
	}

	dsName := clone.GetStringMeta(common.MetaNamespaceDatasourceName)
	if dsName == "" {
		clone.MustSetMeta(common.MetaNamespaceDatasourceName, branchInfo.Name)
	}

	keyProtectionTool, err := e.getKeyProtectionTool(ctx)
	if err != nil {
		return "", err
	}

	streamClient, err := e.getNodeKeyManagerClient().SetNodeInfo(ctx)
	if err != nil {
		log.Logger(ctx).Error("views.handler.encryption.MultiPartCreate: failed to get data.key stream client", zap.Error(err))
		return "", err
	}

	streamer := &setBlockStream{
		client:   streamClient,
		nodeUuid: clone.Uuid,
		keySent:  false,
		ctx:      ctx,
	}

	_, err = e.getNodeInfoForWrite(ctx, clone)
	if err != nil {
		if errors.FromError(err).Code != 404 {
			return "", err
		}

		info, err := e.createNodeInfo(ctx, clone)
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.MultiPartCreate: failed to create node info", zap.Error(err))
			return "", err
		}

		encryptionKeyPlainBytes := info.NodeKey.KeyData
		info.NodeKey.KeyData, err = keyProtectionTool.GetEncrypted(ctx, branchInfo.EncryptionKey, encryptionKeyPlainBytes)
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.MultiPartCreate: failed to encrypt node key", zap.Error(err))
			return "", err
		}

		err = streamer.SendKey(info.NodeKey)
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.MultiPartCreate: failed to create nodeInfo", zap.Error(err))
			return "", err
		}

	} else {
		err = streamer.ClearBlocks(clone.Uuid)
		if err != nil {
			log.Logger(ctx).Error("views.handler.encryption.MultiPartCreate: failed to clear old blocks", zap.Error(err))
			return "", err
		}
	}

	if err := streamer.Close(); err != nil {
		log.Logger(ctx).Error("views.handler.encryption.MultiPartCreate: failed to close setNodeInfo stream", zap.Error(err))
	}
	return e.Next.MultipartCreate(ctx, target, requestData)
}

func (e *Handler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {
	var err error
	branchInfo, ok := nodes.GetBranchInfo(ctx, "in")
	if !ok || branchInfo.EncryptionMode != object.EncryptionMode_MASTER {
		return e.Next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
	}

	clone := target.Clone()
	if len(clone.Uuid) == 0 {
		rsp, readErr := e.Next.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: target,
		})

		if readErr != nil {
			return models.MultipartObjectPart{}, errors.NotFound("views.handler.encryption.MultiPartPutObject", "failed to get node UUID: %s", readErr)
		}

		if len(rsp.Node.Uuid) == 0 {
			return models.MultipartObjectPart{}, errors.NotFound("views.handler.encryption.MultiPartPutObject", "failed to get node UUID")
		}
		clone.Uuid = rsp.Node.Uuid
	}

	dsName := clone.GetStringMeta(common.MetaNamespaceDatasourceName)
	if dsName == "" {
		clone.MustSetMeta(common.MetaNamespaceDatasourceName, branchInfo.Name)
	}

	keyProtectionTool, err := e.getKeyProtectionTool(ctx)
	if err != nil {
		return models.MultipartObjectPart{}, err
	}

	streamClient, err := e.getNodeKeyManagerClient().SetNodeInfo(ctx)
	if err != nil {
		log.Logger(ctx).Error("views.handler.encryption.MultiPartPutObject: failed to save node encryption info", zap.Error(err))
		return models.MultipartObjectPart{}, err
	}

	nodeBlocksStreamer := &setBlockStream{
		client:   streamClient,
		nodeUuid: clone.Uuid,
		keySent:  true,
		partId:   uint32(partNumberMarker),
		ctx:      ctx,
	}
	info, err := e.getNodeInfoForWrite(ctx, clone)
	if err != nil {
		log.Logger(ctx).Error("views.handler.encryption.MultiPartPutObject: failed to get node info", zap.Error(err))
		return models.MultipartObjectPart{}, err
	}

	var encryptionKeyPlainBytes []byte
	encryptionKeyPlainBytes, err = keyProtectionTool.GetDecrypted(ctx, branchInfo.EncryptionKey, info.NodeKey.KeyData)
	if err != nil {
		log.Logger(ctx).Error("views.handler.encryption.MultiPartPutObject: failed to unseal key", zap.Error(err))
		return models.MultipartObjectPart{}, err
	}

	encryptionMaterials := crypto.NewAESGCMMaterials(info, nodeBlocksStreamer)
	if err := encryptionMaterials.SetupEncryptMode(encryptionKeyPlainBytes, reader); err != nil {
		return models.MultipartObjectPart{}, err
	}

	requestData.Md5Sum = nil
	requestData.Sha256Sum = nil
	plainSize := requestData.Size
	requestData.Size = encryptionMaterials.CalculateOutputSize(requestData.Size, info.NodeKey.OwnerId)

	part, err := e.Next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, encryptionMaterials, requestData)
	if err != nil {
		log.Logger(ctx).Error("views.handler.encryption.MultiPartPutObject: Next handler failed", zap.Error(err))
	}
	// Replace part Size with plain size value
	part.Size = plainSize
	return part, err
}

func (e *Handler) copyNodeEncryptionData(ctx context.Context, source *tree.Node, copy *tree.Node) error {
	_, err := e.getNodeKeyManagerClient().CopyNodeInfo(ctx, &encryption.CopyNodeInfoRequest{
		NodeUuid:     source.Uuid,
		NodeCopyUuid: copy.Uuid,
	})
	return err
}

func (e *Handler) getNodeInfoForRead(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (*encryption.NodeInfo, int64, int64, int64, error) {
	nodeEncryptionClient := e.getNodeKeyManagerClient()
	fullRead := requestData.StartOffset == 0 && (requestData.Length <= 0 || requestData.Length == node.Size)
	dsName := node.GetStringMeta(common.MetaNamespaceDatasourceName)
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
	return rsp.NodeInfo, rsp.EncryptedOffset, rsp.EncryptedCount, rsp.HeadSKippedPlainBytesCount, nil
}

func (e *Handler) getNodeInfoForWrite(ctx context.Context, node *tree.Node) (*encryption.NodeInfo, error) {
	nodeEncryptionClient := e.getNodeKeyManagerClient()
	dsName := node.GetStringMeta(common.MetaNamespaceDatasourceName)
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

func (e *Handler) createNodeInfo(ctx context.Context, node *tree.Node) (*encryption.NodeInfo, error) {
	dsName := node.GetStringMeta(common.MetaNamespaceDatasourceName)
	user := fmt.Sprintf("ds:%s", dsName)
	info := new(encryption.NodeInfo)

	//we generate a new key
	info.NodeKey = &encryption.NodeKey{
		UserId:  user,
		NodeId:  node.Uuid,
		OwnerId: user,
	}

	encKey, err := crypto.RandomBytes(32)
	if err != nil {
		return info, err
	}
	info.NodeKey.KeyData = encKey

	info.Node = new(encryption.Node)
	info.Node.Legacy = false
	info.Node.NodeId = node.Uuid

	return info, nil
}

func (e *Handler) getKeyProtectionTool(ctx context.Context) (UserKeyTool, error) {
	tool := e.userKeyTool
	var err error
	if tool == nil {
		tool, err = MasterKeyTool(ctx)
		if err != nil {
			return nil, err
		}
	}
	return tool, err
}

func (e *Handler) getNodeKeyManagerClient() encryption.NodeKeyManagerClient {
	nodeEncryptionClient := e.nodeKeyManagerClient
	if nodeEncryptionClient == nil {
		nodeEncryptionClient = encryption.NewNodeKeyManagerClient(grpc.GetClientConnFromCtx(e.RuntimeCtx, common.ServiceEncKey))
	}
	return nodeEncryptionClient
}

// setBlockStream
type setBlockStream struct {
	client   encryption.NodeKeyManager_SetNodeInfoClient
	keySent  bool
	nodeUuid string
	position uint32
	partId   uint32
	ctx      context.Context
	err      error
}

func (streamer *setBlockStream) SendKey(key *encryption.NodeKey) error {
	if streamer.err != nil {
		return streamer.err
	}

	key.NodeId = streamer.nodeUuid

	streamer.err = streamer.client.Send(&encryption.SetNodeInfoRequest{
		Action: "key",
		SetNodeKey: &encryption.SetNodeKeyRequest{
			NodeKey: key,
		},
	})
	return streamer.err
}

func (streamer *setBlockStream) SendBlock(block *encryption.Block) error {
	if streamer.err != nil {
		return streamer.err
	}

	streamer.position++
	block.Position = streamer.position
	block.PartId = streamer.partId
	block.Nonce = nil

	setNodeInfoRequest := &encryption.SetNodeInfoRequest{
		Action: "block",
		SetBlock: &encryption.SetNodeBlockRequest{
			NodeUuid: streamer.nodeUuid,
			Block:    block,
		},
	}

	streamer.err = streamer.client.Send(setNodeInfoRequest)
	return streamer.err
}

func (streamer *setBlockStream) ClearBlocks(NodeId string) error {
	if streamer.err != nil {
		return streamer.err
	}

	setNodeInfoRequest := &encryption.SetNodeInfoRequest{
		Action: "clearBlocks",
		SetBlock: &encryption.SetNodeBlockRequest{
			NodeUuid: streamer.nodeUuid,
		},
	}

	streamer.err = streamer.client.Send(setNodeInfoRequest)
	return streamer.err
}

func (streamer *setBlockStream) Close() error {
	// send empty node to notify the end of the exchange
	err := streamer.client.Send(&encryption.SetNodeInfoRequest{
		Action: "close",
	})
	if err != nil {
		log.Logger(streamer.ctx).Warn("data.key.service.SetBlockStream: could not send close action")
	}
	return streamer.client.CloseSend()
}
