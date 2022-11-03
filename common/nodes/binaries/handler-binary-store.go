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

package binaries

import (
	"context"
	"io"
	"path"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/tree"
)

func WithStore(name string, transparentGet, allowPut, allowAnonRead bool) nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, &Handler{
			StoreName:      name,
			TransparentGet: transparentGet,
			AllowPut:       allowPut,
			AllowAnonRead:  allowAnonRead,
		})
	}
}

// Handler captures put/get calls to an internal storage
type Handler struct {
	abstract.Handler
	StoreName      string
	TransparentGet bool
	AllowPut       bool
	AllowAnonRead  bool
}

func (a *Handler) Adapt(h nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	a.AdaptOptions(h, options)
	return a
}

func (a *Handler) isStorePath(nodePath string) bool {
	parts := strings.Split(strings.Trim(nodePath, "/"), "/")
	return len(parts) > 0 && parts[0] == a.StoreName
}

func (a *Handler) checkContextForAnonRead(ctx context.Context) error {
	if u := ctx.Value(common.PydioContextUserKey); (u == nil || u == common.PydioS3AnonUsername) && !a.AllowAnonRead {
		return nodes.ErrCannotReadStore(a.StoreName)
	}
	return nil
}

// ListNodes does not display content
func (a *Handler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (c tree.NodeProvider_ListNodesClient, e error) {
	if a.isStorePath(in.Node.Path) {
		emptyStreamer := nodes.NewWrappingStreamer(ctx)
		emptyStreamer.CloseSend()
		return emptyStreamer, nil
	}
	return a.Next.ListNodes(ctx, in, opts...)
}

// ReadNode Node Info & Node Content : send by UUID,
func (a *Handler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	if a.isStorePath(in.Node.Path) {
		source, er := a.ClientsPool.GetDataSourceInfo(a.StoreName)
		if er != nil {
			return nil, er
		}
		if e := a.checkContextForAnonRead(ctx); e != nil {
			return nil, e
		}
		s3client := source.Client
		/*
			statOpts := minio.StatObjectOptions{}
			if meta, mOk := context2.MinioMetaFromContext(ctx); mOk {
				for k, v := range meta {
					statOpts.Set(k, v)
				}
			}
		*/
		objectInfo, err := s3client.StatObject(ctx, source.ObjectsBucket, path.Base(in.Node.Path), nil)
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
			if rn, e := a.ClientsPool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: path.Join(source.Name, path.Base(in.Node.Path))}}, opts...); e == nil {
				node.Size = rn.GetNode().GetSize()
			} else {
				log.Logger(ctx).Debug("Could not update clear size for binary store in read node", zap.Error(e))
			}
		}

		return &tree.ReadNodeResponse{
			Node: node,
		}, nil

	}
	return a.Next.ReadNode(ctx, in, opts...)
}

func (a *Handler) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	if a.isStorePath(node.Path) {
		source, er := a.ClientsPool.GetDataSourceInfo(a.StoreName)
		if e := a.checkContextForAnonRead(ctx); e != nil {
			return nil, e
		}
		if er == nil {
			filter := node.Clone()
			filter.MustSetMeta(common.MetaNamespaceDatasourcePath, path.Base(node.Path))
			filterBi := nodes.BranchInfo{LoadedSource: source}
			if a.TransparentGet {
				// Do not set the Binary flag and just replace node info
				filterBi.TransparentBinary = true
				filter.Path = path.Join(source.Name, path.Base(node.Path))
			} else {
				filterBi.Binary = true
				filter.MustSetMeta(common.MetaNamespaceDatasourcePath, path.Base(node.Path))
			}
			return a.Next.GetObject(nodes.WithBranchInfo(ctx, "in", filterBi), filter, requestData)
		}
	}
	return a.Next.GetObject(ctx, node, requestData)
}

///////////////////////////////
// THIS STORE IS NOT WRITEABLE
///////////////////////////////

func (a *Handler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	if a.isStorePath(in.Node.Path) {
		return nil, nodes.ErrCannotWriteStore(a.StoreName)
	}
	return a.Next.CreateNode(ctx, in, opts...)
}

func (a *Handler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	if a.isStorePath(in.From.Path) || a.isStorePath(in.To.Path) {
		return nil, nodes.ErrCannotWriteStore(a.StoreName)
	}
	return a.Next.UpdateNode(ctx, in, opts...)
}

func (a *Handler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	var dsKey string
	var source nodes.LoadedSource
	if a.isStorePath(in.Node.Path) {
		if !a.AllowPut {
			return nil, nodes.ErrCannotWriteStore(a.StoreName)
		}
		var er error
		if source, er = a.ClientsPool.GetDataSourceInfo(a.StoreName); er == nil {
			ctx = nodes.WithBranchInfo(ctx, "in", nodes.BranchInfo{LoadedSource: source, Binary: true})
			clone := in.Node.Clone()
			dsKey = path.Base(in.Node.Path)
			clone.MustSetMeta(common.MetaNamespaceDatasourcePath, dsKey)
			in.Node = clone
		}
	}
	r, e := a.Next.DeleteNode(ctx, in, opts...)
	if dsKey != "" && e == nil {
		// delete alternate versions if they exists
		s3client := source.Client
		log.Logger(ctx).Debug("Deleting binary alternate version ", zap.String("v", dsKey))
		if res, e := s3client.ListObjects(ctx, source.ObjectsBucket, dsKey, "", "/"); e == nil {
			for _, info := range res.Contents {
				s3client.RemoveObject(ctx, dsKey, info.Key)
			}
		}
	}
	return r, e
}

func (a *Handler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	if a.isStorePath(node.Path) {
		if !a.AllowPut {
			return models.ObjectInfo{}, nodes.ErrCannotWriteStore(a.StoreName)
		}
		source, er := a.ClientsPool.GetDataSourceInfo(a.StoreName)
		if er == nil {
			ctx = nodes.WithBranchInfo(ctx, "in", nodes.BranchInfo{LoadedSource: source, Binary: true})
			clone := node.Clone()
			clone.Uuid = path.Base(node.Path)
			clone.MustSetMeta(common.MetaNamespaceDatasourcePath, path.Base(node.Path))
			return a.Next.PutObject(ctx, clone, reader, requestData)
		} else {
			log.Logger(ctx).Debug("Putting Node Inside Binary Store Cannot find DS Info?", zap.Error(er))
			return models.ObjectInfo{}, er
		}
	}
	return a.Next.PutObject(ctx, node, reader, requestData)
}

func (a *Handler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	if a.isStorePath(from.Path) || a.isStorePath(to.Path) {
		return models.ObjectInfo{}, nodes.ErrCannotWriteStore(a.StoreName)
	}
	return a.Next.CopyObject(ctx, from, to, requestData)
}
