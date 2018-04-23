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
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/patrickmn/go-cache"
	minio "github.com/pydio/minio-go"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

type updaterMethod func(ctx context.Context, identifier string, node *tree.Node) (context.Context, error)

type AbstractBranchFilter struct {
	AbstractHandler
	inputMethod    updaterMethod
	outputMethod   updaterMethod
	RootNodesCache *cache.Cache
}

func (v *AbstractBranchFilter) getRoot(uuid string) (*tree.Node, error) {

	if virtualNode, exists := GetVirtualNodesManager().ByUuid(uuid); exists {
		return virtualNode, nil
	}

	if v.RootNodesCache == nil {
		v.RootNodesCache = cache.New(time.Second*10, time.Second*60)
	}

	if n, ok := v.RootNodesCache.Get(uuid); ok {
		return n.(*tree.Node), nil
	}

	resp, err := v.clientsPool.GetTreeClient().ReadNode(context.Background(), &tree.ReadNodeRequest{Node: &tree.Node{
		Uuid: uuid,
	}})
	if err != nil {
		return nil, err
	}
	v.RootNodesCache.Set(uuid, resp.Node, cache.DefaultExpiration)

	return resp.Node, nil
}

func (v *AbstractBranchFilter) makeRootKey(rNode *tree.Node) string {
	return rNode.Uuid[0:6] + "-" + rNode.GetStringMeta("name")
}

func (v *AbstractBranchFilter) rootKeysMap(rootNodes []string) (map[string]*tree.Node, error) {
	list := make(map[string]*tree.Node, len(rootNodes))
	for _, root := range rootNodes {
		if rNode, err := v.getRoot(root); err == nil {
			list[v.makeRootKey(rNode)] = rNode
		} else {
			return list, err
		}
	}
	return list, nil
}

func (v *AbstractBranchFilter) updateInputBranch(ctx context.Context, identifier string, node *tree.Node) (context.Context, error) {
	return ctx, errors.New(VIEWS_LIBRARY_NAME, "Abstract Method Not Implemented", 500)
}

func (v *AbstractBranchFilter) updateOutputNode(ctx context.Context, identifier string, node *tree.Node) (context.Context, error) {
	return ctx, errors.New(VIEWS_LIBRARY_NAME, "Abstract Method Not Implemented", 500)
}

func (v *AbstractBranchFilter) ExecuteWrapped(inputFilter NodeFilter, outputFilter NodeFilter, provider NodesCallback) error {
	wrappedIn := func(ctx context.Context, inputNode *tree.Node, identifier string) (context.Context, error) {
		ctx, err := inputFilter(ctx, inputNode, identifier)
		if err != nil {
			return ctx, err
		}
		ctx, err = v.inputMethod(ctx, identifier, inputNode)
		if err != nil {
			return ctx, err
		}
		return ctx, nil
	}
	wrappedOut := func(ctx context.Context, outputNode *tree.Node, identifier string) (context.Context, error) {
		c, err := v.outputMethod(ctx, identifier, outputNode)
		if err != nil {
			return c, err
		}
		return outputFilter(ctx, outputNode, identifier)
	}
	return v.next.ExecuteWrapped(wrappedIn, wrappedOut, provider)
}

func (v *AbstractBranchFilter) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	log.Logger(ctx).Debug("ReadNode", zap.Any("handler", fmt.Sprintf("%T", v)))

	ctx, err := v.inputMethod(ctx, "in", in.Node)
	if err != nil {
		return nil, err
	}

	response, err := v.next.ReadNode(ctx, in, opts...)
	if err == nil && response.Node != nil {
		_, oE := v.outputMethod(ctx, "in", response.Node)
		if oE != nil {
			return nil, oE
		}
	}
	return response, err
}

func (v *AbstractBranchFilter) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (streamer tree.NodeProvider_ListNodesClient, e error) {
	ctx, err := v.inputMethod(ctx, "in", in.Node)
	if err != nil {
		return nil, err
	}
	stream, err := v.next.ListNodes(ctx, in, opts...)
	if err != nil {
		return nil, err
	}
	s := NewWrappingStreamer()
	go func() {
		defer stream.Close()
		defer s.Close()
		for {
			resp, err := stream.Recv()
			if err != nil {
				if err != io.EOF && err != io.ErrUnexpectedEOF {
					s.SendError(err)
				}
				break
			}
			if resp == nil {
				continue
			}
			if _, oE := v.outputMethod(ctx, "in", resp.Node); oE != nil {
				continue
			}
			s.Send(resp)
		}
	}()
	return s, nil
}

func (v *AbstractBranchFilter) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
	ctx, err := v.inputMethod(ctx, "from", in.From)
	if err != nil {
		return nil, err
	}
	v.inputMethod(ctx, "to", in.To)

	response, err := v.next.UpdateNode(ctx, in, opts...)
	if response != nil && response.Node != nil {
		_, oE := v.outputMethod(ctx, "to", response.Node)
		if oE != nil {
			return nil, oE
		}
	}
	return response, err
}

func (v *AbstractBranchFilter) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	ctx, err := v.inputMethod(ctx, "in", in.Node)
	if err != nil {
		return nil, err
	}
	return v.next.DeleteNode(ctx, in, opts...)
}

func (v *AbstractBranchFilter) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	ctx, err := v.inputMethod(ctx, "in", in.Node)
	if err != nil {
		return nil, err
	}
	response, err := v.next.CreateNode(ctx, in, opts...)
	if err == nil && response != nil && response.Node != nil {
		_, oE := v.outputMethod(ctx, "in", response.Node)
		if oE != nil {
			return nil, oE
		}
	}
	return response, err
}

func (v *AbstractBranchFilter) GetObject(ctx context.Context, node *tree.Node, requestData *GetRequestData) (io.ReadCloser, error) {
	ctx, err := v.inputMethod(ctx, "in", node)
	if err != nil {
		return nil, err
	}
	return v.next.GetObject(ctx, node, requestData)
}

func (v *AbstractBranchFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {
	ctx, err := v.inputMethod(ctx, "in", node)
	if err != nil {
		return 0, err
	}
	return v.next.PutObject(ctx, node, reader, requestData)
}

func (v *AbstractBranchFilter) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {

	ctx, e := v.inputMethod(ctx, "from", from)
	if e != nil {
		return 0, e
	}
	ctx, e = v.inputMethod(ctx, "to", to)
	if e != nil {
		return 0, e
	}

	return v.next.CopyObject(ctx, from, to, requestData)
}

func (v *AbstractBranchFilter) MultipartCreate(ctx context.Context, node *tree.Node, requestData *MultipartRequestData) (string, error) {
	ctx, err := v.inputMethod(ctx, "in", node)
	if err != nil {
		return "", err
	}
	return v.next.MultipartCreate(ctx, node, requestData)
}

func (v *AbstractBranchFilter) MultipartComplete(ctx context.Context, node *tree.Node, uploadID string, uploadedParts []minio.CompletePart) (minio.ObjectInfo, error) {
	ctx, err := v.inputMethod(ctx, "in", node)
	if err != nil {
		return minio.ObjectInfo{}, err
	}
	return v.next.MultipartComplete(ctx, node, uploadID, uploadedParts)
}

func (v *AbstractBranchFilter) MultipartPutObjectPart(ctx context.Context, node *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *PutRequestData) (minio.ObjectPart, error) {
	ctx, err := v.inputMethod(ctx, "in", node)
	if err != nil {
		log.Logger(ctx).Error("HANDLER-PATH-ABSTRACT-FILTER - error in inputMethod \n", zap.Error(err), zap.Any("\n#####  context", ctx))
		return minio.ObjectPart{}, err
	}
	return v.next.MultipartPutObjectPart(ctx, node, uploadID, partNumberMarker, reader, requestData)
}

func (v *AbstractBranchFilter) MultipartAbort(ctx context.Context, node *tree.Node, uploadID string, requestData *MultipartRequestData) error {
	ctx, err := v.inputMethod(ctx, "in", node)
	if err != nil {
		return err
	}
	return v.next.MultipartAbort(ctx, node, uploadID, requestData)
}

func (v *AbstractBranchFilter) MultipartListObjectParts(ctx context.Context, node *tree.Node, uploadID string, partNumberMarker int, maxParts int) (lpi minio.ListObjectPartsResult, er error) {
	ctx, err := v.inputMethod(ctx, "in", node)
	if err != nil {
		return minio.ListObjectPartsResult{}, err
	}
	return v.next.MultipartListObjectParts(ctx, node, uploadID, partNumberMarker, maxParts)
}
