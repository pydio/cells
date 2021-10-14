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
	"crypto/md5"
	"encoding/hex"
	"io"
	"strings"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/patrickmn/go-cache"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views/models"
	"github.com/pydio/minio-go"
)

// AbstractBranchFilter is a ready-made Handler that can be used by all handlers that just modify the path in one way
// or another before forwarding calls to next handler.
type AbstractBranchFilter struct {
	AbstractHandler
	inputMethod    NodeFilter
	outputMethod   NodeFilter
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
	if len(strings.Split(strings.Trim(rNode.GetPath(), "/"), "/")) == 1 && strings.HasPrefix(rNode.GetUuid(), "DATASOURCE:") {
		// This is a datasource root.
		return strings.TrimPrefix(rNode.GetUuid(), "DATASOURCE:")
	}
	if rNode.HasMetaKey("resolution") {
		// This is a template path
		return "template-" + rNode.GetUuid()
	}
	// make a unique prefix. md5 to be sure it's varying and longer than 8 chars
	hash := md5.New()
	hash.Write([]byte(rNode.Uuid))
	rand := hex.EncodeToString(hash.Sum(nil))
	return rand[0:8] + "-" + rNode.GetStringMeta("name")
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
	wrappedIn := func(ctx context.Context, inputNode *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		ctx, filtered, err := inputFilter(ctx, inputNode, identifier)
		if err != nil {
			return ctx, filtered, err
		}
		ctx, filtered, err = v.inputMethod(ctx, filtered, identifier)
		if err != nil {
			return ctx, filtered, err
		}
		return ctx, filtered, nil
	}
	wrappedOut := func(ctx context.Context, outputNode *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		c, filtered, err := v.outputMethod(ctx, outputNode, identifier)
		if err != nil {
			return c, filtered, err
		}
		return outputFilter(ctx, filtered, identifier)
	}
	return v.next.ExecuteWrapped(wrappedIn, wrappedOut, provider)
}

func (v *AbstractBranchFilter) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	ctx, out, err := v.inputMethod(ctx, in.Node, "in")
	if err != nil {
		return nil, err
	}
	response, err := v.next.ReadNode(ctx, &tree.ReadNodeRequest{
		Node:              out,
		WithCommits:       in.WithCommits,
		WithExtendedStats: in.WithExtendedStats,
		ObjectStats:       in.ObjectStats,
	}, opts...)
	if err == nil && response.Node != nil {
		_, out2, oE := v.outputMethod(ctx, response.Node, "in")
		if oE != nil {
			return nil, oE
		}
		response.Node = out2
	}
	return response, err
}

func (v *AbstractBranchFilter) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (streamer tree.NodeProvider_ListNodesClient, e error) {
	ctx, out, err := v.inputMethod(ctx, in.Node, "in")
	if err != nil {
		return nil, err
	}
	newReq := proto.Clone(in).(*tree.ListNodesRequest)
	newReq.Node = out
	stream, err := v.next.ListNodes(ctx, newReq, opts...)
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
			if _, out, oE := v.outputMethod(ctx, resp.Node, "in"); oE != nil {
				continue
			} else {
				resp.Node = out
			}
			s.Send(resp)
		}
	}()
	return s, nil
}

func (v *AbstractBranchFilter) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...client.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {

	ctx, rootPathNode, err := v.inputMethod(ctx, &tree.Node{Path: in.RootPath}, "in")
	if err != nil {
		return nil, err
	}
	newReq := proto.Clone(in).(*tree.StreamChangesRequest)
	newReq.RootPath = rootPathNode.Path
	stream, err := v.next.StreamChanges(ctx, newReq, opts...)
	if err != nil {
		return nil, err
	}
	s := NewChangesWrappingStreamer()
	go func() {
		defer stream.Close()
		defer s.Close()
		for {
			ev, err := stream.Recv()
			if err != nil {
				if err != io.EOF && err != io.ErrUnexpectedEOF {
					s.SendError(err)
				}
				break
			}
			if ev == nil {
				continue
			}
			event := proto.Clone(ev).(*tree.NodeChangeEvent)
			if event.Target != nil {
				if _, out, oE := v.outputMethod(ctx, event.Target, "in"); oE != nil {
					event.Target = nil
				} else {
					event.Target = out
				}
			}
			if event.Source != nil {
				if _, out, oE := v.outputMethod(ctx, event.Source, "in"); oE != nil {
					event.Source = nil
				} else {
					event.Source = out
				}
			}
			if event.Target == nil && event.Source == nil {
				continue
			} else if event.Target == nil && event.Type != tree.NodeChangeEvent_DELETE {
				event.Type = tree.NodeChangeEvent_DELETE
			} else if event.Source == nil && event.Type != tree.NodeChangeEvent_CREATE {
				event.Type = tree.NodeChangeEvent_CREATE
			}
			s.Send(event)
		}
	}()
	return s, nil
}

func (v *AbstractBranchFilter) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
	ctx, out, err := v.inputMethod(ctx, in.From, "from")
	if err != nil {
		return nil, err
	}
	ctx, outTo, _ := v.inputMethod(ctx, in.To, "to")

	newReq := proto.Clone(in).(*tree.UpdateNodeRequest)
	newReq.From = out
	newReq.To = outTo

	response, err := v.next.UpdateNode(ctx, newReq, opts...)
	if response != nil && response.Node != nil {
		_, outResp, oE := v.outputMethod(ctx, response.Node, "to")
		if oE != nil {
			return nil, oE
		}
		response.Node = outResp
	}
	return response, err
}

func (v *AbstractBranchFilter) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	ctx, out, err := v.inputMethod(ctx, in.Node, "in")
	if err != nil {
		return nil, err
	}
	newReq := proto.Clone(in).(*tree.DeleteNodeRequest)
	newReq.Node = out
	return v.next.DeleteNode(ctx, newReq, opts...)
}

func (v *AbstractBranchFilter) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	ctx, filtered, err := v.inputMethod(ctx, in.Node, "in")
	if err != nil {
		return nil, err
	}
	newReq := proto.Clone(in).(*tree.CreateNodeRequest)
	newReq.Node = filtered
	response, err := v.next.CreateNode(ctx, newReq, opts...)
	if err == nil && response != nil && response.Node != nil {
		_, out, oE := v.outputMethod(ctx, response.Node, "in")
		if oE != nil {
			return nil, oE
		}
		response.Node = out
	}
	return response, err
}

func (v *AbstractBranchFilter) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	ctx, filtered, err := v.inputMethod(ctx, node, "in")
	if err != nil {
		return nil, err
	}
	return v.next.GetObject(ctx, filtered, requestData)
}

func (v *AbstractBranchFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {
	ctx, filtered, err := v.inputMethod(ctx, node, "in")
	if err != nil {
		return 0, err
	}
	return v.next.PutObject(ctx, filtered, reader, requestData)
}

func (v *AbstractBranchFilter) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error) {

	var outF, outT *tree.Node
	var e error
	ctx, outF, e = v.inputMethod(ctx, from, "from")
	if e != nil {
		return 0, e
	}
	ctx, outT, e = v.inputMethod(ctx, to, "to")
	if e != nil {
		return 0, e
	}

	return v.next.CopyObject(ctx, outF, outT, requestData)
}

func (v *AbstractBranchFilter) MultipartCreate(ctx context.Context, node *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	ctx, filtered, err := v.inputMethod(ctx, node, "in")
	if err != nil {
		return "", err
	}
	return v.next.MultipartCreate(ctx, filtered, requestData)
}

func (v *AbstractBranchFilter) MultipartComplete(ctx context.Context, node *tree.Node, uploadID string, uploadedParts []minio.CompletePart) (minio.ObjectInfo, error) {
	ctx, filtered, err := v.inputMethod(ctx, node, "in")
	if err != nil {
		return minio.ObjectInfo{}, err
	}
	return v.next.MultipartComplete(ctx, filtered, uploadID, uploadedParts)
}

func (v *AbstractBranchFilter) MultipartPutObjectPart(ctx context.Context, node *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (minio.ObjectPart, error) {
	ctx, filtered, err := v.inputMethod(ctx, node, "in")
	if err != nil {
		log.Logger(ctx).Error("HANDLER-PATH-ABSTRACT-FILTER - error in inputMethod \n", zap.Error(err), zap.Any("\n#####  context", ctx))
		return minio.ObjectPart{}, err
	}
	return v.next.MultipartPutObjectPart(ctx, filtered, uploadID, partNumberMarker, reader, requestData)
}

func (v *AbstractBranchFilter) MultipartAbort(ctx context.Context, node *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	ctx, filtered, err := v.inputMethod(ctx, node, "in")
	if err != nil {
		return err
	}
	return v.next.MultipartAbort(ctx, filtered, uploadID, requestData)
}

func (v *AbstractBranchFilter) MultipartListObjectParts(ctx context.Context, node *tree.Node, uploadID string, partNumberMarker int, maxParts int) (lpi minio.ListObjectPartsResult, er error) {
	ctx, filtered, err := v.inputMethod(ctx, node, "in")
	if err != nil {
		return minio.ListObjectPartsResult{}, err
	}
	return v.next.MultipartListObjectParts(ctx, filtered, uploadID, partNumberMarker, maxParts)
}
