/*
 * Copyright (c) 2021. Abstrium SAS <team (at) pydio.com>
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
	"strconv"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"github.com/pydio/minio-go"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	context2 "github.com/pydio/cells/common/utils/context"
)

// FlatStorageHandler intercepts request to a flat-storage
type FlatStorageHandler struct {
	AbstractHandler
}

func isFlatStorage(ctx context.Context) bool {
	if info, ok := GetBranchInfo(ctx, "in"); ok && info.FlatStorage && !info.Binary {
		return true
	}
	return false
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

func (f *FlatStorageHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	if !isFlatStorage(ctx) || in.GetNode().IsLeaf() {
		return f.next.CreateNode(ctx, in, opts...)
	}
	// Folder : create directly in index
	return f.clientsPool.GetTreeClientWrite().CreateNode(ctx, in, opts...)
}

func (f *FlatStorageHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	isFlat := isFlatStorage(ctx)
	if isFlat && !in.GetNode().IsLeaf() {
		return f.clientsPool.GetTreeClientWrite().DeleteNode(ctx, in)
	}
	resp, e := f.next.DeleteNode(ctx, in, opts...)
	if isFlatStorage(ctx) && e == nil && resp.Success {
		// Update index directly
		return f.clientsPool.GetTreeClientWrite().DeleteNode(ctx, in)
	}
	return resp, e
}

func (f *FlatStorageHandler) GetObject(ctx context.Context, node *tree.Node, requestData *GetRequestData) (io.ReadCloser, error) {
	if isFlatStorage(ctx) {
		if e := f.resolveUUID(ctx, node); e != nil {
			return nil, e
		}
	}
	return f.next.GetObject(ctx, node, requestData)
}

// postCreate updates index after upload by re-read newly added S3 object to get ETag
func (f *FlatStorageHandler) postCreate(ctx context.Context, node *tree.Node, requestMeta map[string]string) error {
	updateResp, err := f.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
	if err != nil {
		return err
	}
	updateNode := updateResp.GetNode()
	stats, err := f.ReadNode(ctx, &tree.ReadNodeRequest{Node: node, ObjectStats: true})
	if err != nil {
		return err
	}
	updateNode.MTime = stats.GetNode().GetMTime()
	updateNode.Size = stats.GetNode().GetSize()
	if requestMeta != nil {
		if pS, o := requestMeta[common.XAmzMetaClearSize]; o {
			if metaSize, e := strconv.ParseInt(pS, 10, 64); e == nil {
				updateNode.Size = metaSize
			}
		}
	}
	updateNode.Etag = stats.GetNode().GetEtag()
	_, er := f.clientsPool.GetTreeClientWrite().CreateNode(ctx, &tree.CreateNodeRequest{Node: updateNode, UpdateIfExists: true})
	if er != nil {
		return er
	}
	return nil
}

func (f *FlatStorageHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {

	// If DS's are same datasource, simple S3 Copy operation. Otherwise it must copy from one to another.
	destInfo, ok := GetBranchInfo(ctx, "to")
	if !ok {
		return 0, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find Client for src or dest")
	}
	if destInfo.FlatStorage {
		if len(requestData.SrcVersionId) > 0 {
			if e := f.resolveUUID(ctx, to); e != nil {
				return 0, e
			}
		} else {
			// Insert in tree as temporary
			temporary := to.Clone()
			temporary.Uuid = uuid.New()
			if dir, o := requestData.Metadata[common.XAmzMetaDirective]; o && dir == "COPY" {
				temporary.Uuid = from.Uuid
			}
			temporary.Type = tree.NodeType_LEAF
			temporary.Etag = common.NodeFlagEtagTemporary
			if _, er := f.clientsPool.GetTreeClientWrite().CreateNode(ctx, &tree.CreateNodeRequest{Node: temporary}); er != nil {
				return 0, er
			}
			// Attach Uuid to target node
			to.Uuid = temporary.Uuid
		}
	}
	i, e := f.next.CopyObject(ctx, from, to, requestData)
	if e == nil && destInfo.FlatStorage {
		// Create an "in" context with resolver
		tgtCtx := WithBranchInfo(ctx, "in", destInfo)
		if requestData.Metadata != nil {
			if _, ok := requestData.Metadata[common.XPydioMoveUuid]; ok {
				tgtCtx = context2.WithAdditionalMetadata(tgtCtx, requestData.Metadata)
			}
		}
		// Now store in index
		if er := f.postCreate(tgtCtx, to, requestData.Metadata); er != nil {
			return i, er
		}
	}
	return i, e
}

func (f *FlatStorageHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {
	i, e := f.next.PutObject(ctx, node, reader, requestData)
	if e == nil && isFlatStorage(ctx) {
		if er := f.postCreate(ctx, node, requestData.Metadata); er != nil {
			return i, er
		}
	}
	return i, e
}

func (f *FlatStorageHandler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *PutRequestData) (minio.ObjectPart, error) {
	if isFlatStorage(ctx) {
		if e := f.resolveUUID(ctx, target); e != nil {
			return minio.ObjectPart{}, e
		}
	}
	return f.next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

func (f *FlatStorageHandler) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []minio.CompletePart) (minio.ObjectInfo, error) {
	if isFlatStorage(ctx) {
		if e := f.resolveUUID(ctx, target); e != nil {
			return minio.ObjectInfo{}, e
		}
	}
	info, e := f.next.MultipartComplete(ctx, target, uploadID, uploadedParts)
	if e == nil && isFlatStorage(ctx) {
		// We assume MultipartCreate has already set the clear-size in the index, otherwise we have to find the correct value
		meta := map[string]string{}
		if target.Size == 0 {
			if branchInfo, ok := GetBranchInfo(ctx, "in"); ok && branchInfo.EncryptionMode != object.EncryptionMode_CLEAR {
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
		if er := f.postCreate(ctx, target, meta); er != nil {
			return info, er
		}
	}
	return info, e
}

var keyClient encryption.NodeKeyManagerClient

func (f *FlatStorageHandler) encPlainSizeRecompute(ctx context.Context, nodeUUID, dsName string) (int64, error) {
	if keyClient == nil {
		keyClient = encryption.NewNodeKeyManagerClient(registry.GetClient(common.ServiceEncKey))
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

func (f *FlatStorageHandler) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (lpi minio.ListObjectPartsResult, err error) {
	if isFlatStorage(ctx) {
		if e := f.resolveUUID(ctx, target); e != nil {
			return minio.ListObjectPartsResult{}, e
		}
	}
	return f.next.MultipartListObjectParts(ctx, target, uploadID, partNumberMarker, maxParts)
}

func (f *FlatStorageHandler) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *MultipartRequestData) error {
	if isFlatStorage(ctx) {
		if e := f.resolveUUID(ctx, target); e != nil {
			return e
		}
	}
	return f.next.MultipartAbort(ctx, target, uploadID, requestData)
}
