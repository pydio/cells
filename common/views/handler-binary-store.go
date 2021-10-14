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
	"io"
	"path"
	"strings"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/cells/common/views/models"
)

// BinaryStoreHandler captures put/get calls to an internal storage
type BinaryStoreHandler struct {
	AbstractHandler
	StoreName      string
	TransparentGet bool
	AllowPut       bool
	AllowAnonRead  bool
}

func (a *BinaryStoreHandler) isStorePath(nodePath string) bool {
	parts := strings.Split(strings.Trim(nodePath, "/"), "/")
	return len(parts) > 0 && parts[0] == a.StoreName
}

func (a *BinaryStoreHandler) checkContextForAnonRead(ctx context.Context) error {
	if u := ctx.Value(common.PydioContextUserKey); (u == nil || u == common.PydioS3AnonUsername) && !a.AllowAnonRead {
		return errors.Forbidden(VIEWS_LIBRARY_NAME, "you are not allowed to access this content")
	}
	return nil
}

// ListNodes does not display content
func (a *BinaryStoreHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (c tree.NodeProvider_ListNodesClient, e error) {
	if a.isStorePath(in.Node.Path) {
		emptyStreamer := NewWrappingStreamer()
		emptyStreamer.Close()
		return emptyStreamer, nil
	}
	return a.next.ListNodes(ctx, in, opts...)
}

// ReadNode Node Info & Node Content : send by UUID,
func (a *BinaryStoreHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	if a.isStorePath(in.Node.Path) {
		source, er := a.clientsPool.GetDataSourceInfo(a.StoreName)
		if er != nil {
			return nil, er
		}
		if e := a.checkContextForAnonRead(ctx); e != nil {
			return nil, e
		}
		s3client := source.Client
		statOpts := minio.StatObjectOptions{}
		if meta, mOk := context2.MinioMetaFromContext(ctx); mOk {
			for k, v := range meta {
				statOpts.Set(k, v)
			}
		}
		objectInfo, err := s3client.StatObject(source.ObjectsBucket, path.Base(in.Node.Path), statOpts)
		if err != nil {
			return nil, err
		}
		node := &tree.Node{
			Path:  a.StoreName + "/" + objectInfo.Key,
			Size:  objectInfo.Size,
			MTime: objectInfo.LastModified.Unix(),
			Etag:  objectInfo.ETag,
			Type:  tree.NodeType_LEAF,
			Uuid:  objectInfo.Key,
			Mode:  0777,
		}
		// Special case if DS is encrypted - update node with clear size
		if a.TransparentGet && source.EncryptionMode != object.EncryptionMode_CLEAR {
			if rn, e := a.clientsPool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: path.Join(source.Name, path.Base(in.Node.Path))}}, opts...); e == nil {
				node.Size = rn.GetNode().GetSize()
			} else {
				log.Logger(ctx).Debug("Could not update clear size for binary store in read node", zap.Error(e))
			}
		}

		return &tree.ReadNodeResponse{
			Node: node,
		}, nil

	}
	return a.next.ReadNode(ctx, in, opts...)
}

func (a *BinaryStoreHandler) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	if a.isStorePath(node.Path) {
		source, er := a.clientsPool.GetDataSourceInfo(a.StoreName)
		if e := a.checkContextForAnonRead(ctx); e != nil {
			return nil, e
		}
		if er == nil {
			filter := node.Clone()
			filter.SetMeta(common.MetaNamespaceDatasourcePath, path.Base(node.Path))
			filterBi := BranchInfo{LoadedSource: source}
			if a.TransparentGet {
				// Do not set the Binary flag and just replace node info
				filterBi.TransparentBinary = true
				filter.Path = path.Join(source.Name, path.Base(node.Path))
			} else {
				filterBi.Binary = true
				filter.SetMeta(common.MetaNamespaceDatasourcePath, path.Base(node.Path))
			}
			return a.next.GetObject(WithBranchInfo(ctx, "in", filterBi), filter, requestData)
		}
	}
	return a.next.GetObject(ctx, node, requestData)
}

///////////////////////////////
// THIS STORE IS NOT WRITEABLE
///////////////////////////////

func (a *BinaryStoreHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	if a.isStorePath(in.Node.Path) {
		return nil, errors.Forbidden(VIEWS_LIBRARY_NAME, "Forbidden store")
	}
	return a.next.CreateNode(ctx, in, opts...)
}

func (a *BinaryStoreHandler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
	if a.isStorePath(in.From.Path) || a.isStorePath(in.To.Path) {
		return nil, errors.Forbidden(VIEWS_LIBRARY_NAME, "Forbidden store")
	}
	return a.next.UpdateNode(ctx, in, opts...)
}

func (a *BinaryStoreHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	var dsKey string
	var source LoadedSource
	if a.isStorePath(in.Node.Path) {
		if !a.AllowPut {
			return nil, errors.Forbidden(VIEWS_LIBRARY_NAME, "Forbidden store")
		}
		var er error
		if source, er = a.clientsPool.GetDataSourceInfo(a.StoreName); er == nil {
			ctx = WithBranchInfo(ctx, "in", BranchInfo{LoadedSource: source, Binary: true})
			clone := in.Node.Clone()
			dsKey = path.Base(in.Node.Path)
			clone.SetMeta(common.MetaNamespaceDatasourcePath, dsKey)
			in.Node = clone
		}
	}
	r, e := a.next.DeleteNode(ctx, in, opts...)
	if dsKey != "" && e == nil {
		// delete alternate versions if they exists
		s3client := source.Client
		log.Logger(ctx).Info("Deleting binary alternate version ", zap.String("v", dsKey))
		if res, e := s3client.ListObjectsWithContext(ctx, source.ObjectsBucket, dsKey, "", "/", -1); e == nil {
			for _, info := range res.Contents {
				s3client.RemoveObjectWithContext(ctx, dsKey, info.Key)
			}
		}
	}
	return r, e
}

func (a *BinaryStoreHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {
	if a.isStorePath(node.Path) {
		if !a.AllowPut {
			return 0, errors.Forbidden(VIEWS_LIBRARY_NAME, "Forbidden store")
		}
		source, er := a.clientsPool.GetDataSourceInfo(a.StoreName)
		if er == nil {
			ctx = WithBranchInfo(ctx, "in", BranchInfo{LoadedSource: source, Binary: true})
			clone := node.Clone()
			clone.Uuid = path.Base(node.Path)
			clone.SetMeta(common.MetaNamespaceDatasourcePath, path.Base(node.Path))
			return a.next.PutObject(ctx, clone, reader, requestData)
		} else {
			log.Logger(ctx).Debug("Putting Node Inside Binary Store Cannot find DS Info?", zap.Error(er))
			return 0, er
		}
	}
	return a.next.PutObject(ctx, node, reader, requestData)
}

func (a *BinaryStoreHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error) {
	if a.isStorePath(from.Path) || a.isStorePath(to.Path) {
		return 0, errors.Forbidden(VIEWS_LIBRARY_NAME, "Forbidden store")
	}
	return a.next.CopyObject(ctx, from, to, requestData)
}
