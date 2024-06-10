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

package core

import (
	"context"
	"fmt"
	"io"
	"strconv"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/serviceerrors"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func WithFlatInterceptor() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, &FlatStorageHandler{})
	}
}

var keyClient encryption.NodeKeyManagerClient

// FlatStorageHandler intercepts request to a flat-storage
type FlatStorageHandler struct {
	abstract.Handler
}

func (f *FlatStorageHandler) Adapt(h nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	f.Next = h
	f.ClientsPool = options.Pool
	return f
}

// CreateNode creates directly in index, but make sure not to override
func (f *FlatStorageHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	if !nodes.IsFlatStorage(ctx, "in") || in.GetNode().IsLeaf() {
		return f.Next.CreateNode(ctx, in, opts...)
	}
	if r, e := f.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: in.GetNode().GetPath()}}); e == nil && r.GetNode() != nil {
		rNode := r.GetNode()
		if rNode.IsLeaf() {
			return nil, serviceerrors.Forbidden("cannot.override.file", "trying to create a folder on top of an existing file")
		}
		rNode.MustSetMeta(common.MetaFlagIndexed, true)
		return &tree.CreateNodeResponse{Node: rNode}, nil
	}
	cResp, cErr := f.ClientsPool.GetTreeClientWrite().CreateNode(ctx, in, opts...)
	if cErr == nil && cResp.GetNode() != nil {
		cResp.GetNode().MustSetMeta(common.MetaFlagIndexed, true)
	}
	return cResp, cErr
}

func (f *FlatStorageHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	isFlat := nodes.IsFlatStorage(ctx, "in")
	if isFlat && !in.GetNode().IsLeaf() {
		return f.ClientsPool.GetTreeClientWrite().DeleteNode(ctx, in)
	}
	resp, e := f.Next.DeleteNode(ctx, in, opts...)
	if isFlat && e == nil && resp.Success {
		// Update index directly
		return f.ClientsPool.GetTreeClientWrite().DeleteNode(ctx, in)
	}
	return resp, e
}

func (f *FlatStorageHandler) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	if nodes.IsFlatStorage(ctx, "in") {
		if e := f.resolveUUID(ctx, node); e != nil {
			return nil, e
		}
	}
	return f.Next.GetObject(ctx, node, requestData)
}

func (f *FlatStorageHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {

	var revertNode *tree.Node
	if requestData.Metadata == nil {
		requestData.Metadata = map[string]string{}
	}
	if nodes.IsFlatStorage(ctx, "to") {
		if len(requestData.SrcVersionId) > 0 {
			if e := f.resolveUUID(ctx, to); e != nil {
				return models.ObjectInfo{}, e
			}
		} else {
			// Insert in tree as temporary
			temporary := to.Clone()
			if dir, o := requestData.Metadata[common.XAmzMetaDirective]; o && dir == "COPY" { // MOVE CASE = Copy original metadata
				temporary.Uuid = from.Uuid
			} else if temporary.Uuid == "" || temporary.Uuid == from.Uuid {
				temporary.Uuid = uuid.New()
				// Copy - Uuid maybe specified by a previous handler
				if metaUuid, ok := requestData.Metadata[common.XAmzMetaNodeUuid]; ok && metaUuid != "" {
					temporary.Uuid = metaUuid
				}
			}
			temporary.Type = tree.NodeType_LEAF
			temporary.Etag = common.NodeFlagEtagTemporary
			if ctype := from.GetStringMeta(common.MetaNamespaceMime); ctype != "" {
				temporary.MustSetMeta(common.MetaNamespaceMime, ctype)
			}
			if _, er := f.ClientsPool.GetTreeClientWrite().CreateNode(ctx, &tree.CreateNodeRequest{Node: temporary}); er != nil {
				return models.ObjectInfo{}, er
			}
			// Attach Uuid to target node
			to.Uuid = temporary.Uuid
			revertNode = temporary
		}
	}
	objectInfo, e := f.Next.CopyObject(ctx, from, to, requestData)
	if e == nil && nodes.IsFlatStorage(ctx, "to") {
		// Create an "in" context with resolver
		destInfo, _ := nodes.GetBranchInfo(ctx, "to")
		tgtCtx := nodes.WithBranchInfo(ctx, "in", destInfo)
		if _, ok := requestData.Metadata[common.XPydioMoveUuid]; ok {
			tgtCtx = propagator.WithAdditionalMetadata(tgtCtx, requestData.Metadata)
		}
		requestData.Metadata[common.MetaNamespaceMime] = from.GetStringMeta(common.MetaNamespaceMime)
		// Now store in index
		if er := f.postCreate(tgtCtx, to, requestData.Metadata, &objectInfo); er != nil {
			return objectInfo, er
		}
	} else if e != nil && revertNode != nil {
		if _, de := f.ClientsPool.GetTreeClientWrite().DeleteNode(ctx, &tree.DeleteNodeRequest{Node: revertNode}); de != nil {
			log.Logger(ctx).Error("Error while copying object and error while reverting index node", zap.Error(de), revertNode.ZapPath())
		} else {
			log.Logger(ctx).Warn("Error while copying object, reverted index node", revertNode.ZapPath())
		}
	}
	return objectInfo, e
}

func (f *FlatStorageHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	objectInfo, e := f.Next.PutObject(ctx, node, reader, requestData)
	if e == nil && nodes.IsFlatStorage(ctx, "in") {
		if ex, o := reader.(common.ReaderMetaExtractor); o {
			if mm, ok := ex.ExtractedMeta(); ok {
				if requestData.Metadata == nil {
					requestData.Metadata = map[string]string{}
				}
				for k, v := range mm {
					requestData.Metadata[k] = v
				}
			}
		}
		if er := f.postCreate(ctx, node, requestData.Metadata, &objectInfo); er != nil {
			return objectInfo, er
		}
	}
	return objectInfo, e
}

func (f *FlatStorageHandler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {
	if nodes.IsFlatStorage(ctx, "in") {
		if e := f.resolveUUID(ctx, target); e != nil {
			return models.MultipartObjectPart{}, e
		}
	}
	return f.Next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

func (f *FlatStorageHandler) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	if nodes.IsFlatStorage(ctx, "in") {
		if e := f.resolveUUID(ctx, target); e != nil {
			return models.ObjectInfo{}, e
		}
	}
	info, e := f.Next.MultipartComplete(ctx, target, uploadID, uploadedParts)
	if e == nil && nodes.IsFlatStorage(ctx, "in") {
		// We assume MultipartCreate has already set the clear-size in the index, otherwise we have to find the correct value
		meta := map[string]string{}
		if target.Size == 0 {
			if branchInfo, ok := nodes.GetBranchInfo(ctx, "in"); ok && branchInfo.EncryptionMode != object.EncryptionMode_CLEAR {
				if pS, e := f.encPlainSizeRecompute(ctx, target.GetUuid(), branchInfo.Name); e == nil {
					// We have to reload the size from encryption service
					//fmt.Println("Reading plain size from nodeKey service", pS)
					meta[common.XAmzMetaClearSize] = fmt.Sprintf("%d", pS)
				}
			} else {
				//fmt.Println("Setting size from uploaded S3 object", info.Size)
				meta[common.XAmzMetaClearSize] = fmt.Sprintf("%d", info.Size)
			}
		}
		if h := target.GetStringMeta(common.MetaNamespaceHash); h != "" {
			meta[common.MetaNamespaceHash] = h
		}
		if er := f.postCreate(ctx, target, meta, &info); er != nil {
			return info, er
		}
	}
	return info, e
}

func (f *FlatStorageHandler) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (lpi models.ListObjectPartsResult, err error) {
	if nodes.IsFlatStorage(ctx, "in") {
		if e := f.resolveUUID(ctx, target); e != nil {
			return models.ListObjectPartsResult{}, e
		}
	}
	return f.Next.MultipartListObjectParts(ctx, target, uploadID, partNumberMarker, maxParts)
}

func (f *FlatStorageHandler) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	if nodes.IsFlatStorage(ctx, "in") {
		if e := f.resolveUUID(ctx, target); e != nil {
			return e
		}
	}
	return f.Next.MultipartAbort(ctx, target, uploadID, requestData)
}

func (f *FlatStorageHandler) resolveUUID(ctx context.Context, node *tree.Node) error {
	if node.GetUuid() != "" {
		return nil
	}
	if r, e := f.ReadNode(ctx, &tree.ReadNodeRequest{Node: node}); e != nil {
		return e
	} else {
		node.Uuid = r.GetNode().GetUuid()
	}
	return nil
}

// postCreate updates index after upload - detect MetaNamespaceHash
func (f *FlatStorageHandler) postCreate(ctx context.Context, node *tree.Node, requestMeta map[string]string, object *models.ObjectInfo) error {
	var updateNode *tree.Node
	if updateResp, err := f.ReadNode(ctx, &tree.ReadNodeRequest{Node: node}); err == nil {
		updateNode = updateResp.GetNode()
	} else if node.Uuid != "" {
		updateNode = node
	} else {
		return fmt.Errorf("missing uuid info to postCreate node")
	}
	if object != nil {
		updateNode.MTime = object.LastModified.Unix()
		updateNode.Size = object.Size
		updateNode.Etag = object.ETag
	} else if ss, err := f.ReadNode(ctx, &tree.ReadNodeRequest{Node: node, ObjectStats: true}); err == nil {
		n := ss.GetNode()
		updateNode.MTime = n.GetMTime()
		updateNode.Size = n.GetSize()
		updateNode.Etag = n.GetEtag()
	} else {
		return err
	}
	if requestMeta != nil {
		if pS, o := requestMeta[common.XAmzMetaClearSize]; o {
			if metaSize, e := strconv.ParseInt(pS, 10, 64); e == nil {
				updateNode.Size = metaSize
			}
		}
		if hash, o := requestMeta[common.MetaNamespaceHash]; o {
			updateNode.MustSetMeta(common.MetaNamespaceHash, hash)
		}
		if cType, o := requestMeta[common.XContentType]; o && !nodes.IsDefaultMime(cType) {
			updateNode.MustSetMeta(common.MetaNamespaceMime, cType)
		} else if cTypeL, o := requestMeta[strings.ToLower(common.XContentType)]; o && !nodes.IsDefaultMime(cTypeL) {
			updateNode.MustSetMeta(common.MetaNamespaceMime, cTypeL)
		}
	}
	_, er := f.ClientsPool.GetTreeClientWrite().CreateNode(ctx, &tree.CreateNodeRequest{Node: updateNode, UpdateIfExists: true})
	return er
}

func (f *FlatStorageHandler) encPlainSizeRecompute(ctx context.Context, nodeUUID, dsName string) (int64, error) {
	if keyClient == nil {
		keyClient = encryption.NewNodeKeyManagerClient(grpc2.ResolveConn(ctx, common.ServiceEncKey))
	}
	if resp, e := keyClient.GetNodePlainSize(ctx, &encryption.GetNodePlainSizeRequest{
		NodeId: nodeUUID,
		UserId: "ds:" + dsName,
	}); e == nil {
		return resp.GetSize(), nil
	} else {
		return 0, e
	}
}
