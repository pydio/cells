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

package abstract

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"io"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
)

var rootNodesCacheConfig = cache.Config{
	Prefix:      "nodes/root-nodes",
	Eviction:    "10s",
	CleanWindow: "60s",
}

// BranchFilter is a ready-made Handler that can be used by all handlers that just modify the path in one way
// or another before forwarding calls to Next handler.
type BranchFilter struct {
	Handler
	InputMethod  nodes.FilterFunc
	OutputMethod nodes.FilterFunc
}

func (v *BranchFilter) LookupRoot(ctx context.Context, uuid string) (*tree.Node, error) {

	if virtualNode, exists := GetVirtualProvider().ByUuid(ctx, uuid); exists {
		return virtualNode, nil
	}

	ca, _ := cache_helper.ResolveCache(ctx, common.CacheTypeLocal, rootNodesCacheConfig)

	var n *tree.Node
	if ca != nil && ca.Get(uuid, &n) {
		return n, nil
	}

	resp, err := nodes.GetSourcesPool(ctx).GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{
		Uuid: uuid,
	}})
	if err != nil {
		return nil, err
	}
	if ca != nil {
		_ = ca.Set(uuid, resp.Node)
	}

	return resp.Node, nil
}

func (v *BranchFilter) MakeRootKey(rNode *tree.Node) string {
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

func (v *BranchFilter) GetRootKeys(ctx context.Context, rootNodes []string) (map[string]*tree.Node, error) {
	list := make(map[string]*tree.Node, len(rootNodes))
	for _, root := range rootNodes {
		if rNode, err := v.LookupRoot(ctx, root); err == nil {
			list[v.MakeRootKey(rNode)] = rNode
		} else {
			return list, err
		}
	}
	return list, nil
}

func (v *BranchFilter) updateInputBranch(ctx context.Context, identifier string, node *tree.Node) (context.Context, error) {
	return ctx, errors.WithStack(errors.StatusNotImplemented)
}

func (v *BranchFilter) updateOutputNode(ctx context.Context, identifier string, node *tree.Node) (context.Context, error) {
	return ctx, errors.WithStack(errors.StatusNotImplemented)
}

func (v *BranchFilter) ExecuteWrapped(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc, provider nodes.CallbackFunc) error {
	wrappedIn := func(ctx context.Context, inputNode *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		ctx, filtered, err := inputFilter(ctx, inputNode, identifier)
		if err != nil {
			return ctx, filtered, err
		}
		ctx, filtered, err = v.InputMethod(ctx, filtered, identifier)
		if err != nil {
			return ctx, filtered, err
		}
		return ctx, filtered, nil
	}
	wrappedOut := func(ctx context.Context, outputNode *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		c, filtered, err := v.OutputMethod(ctx, outputNode, identifier)
		if err != nil {
			return c, filtered, err
		}
		return outputFilter(ctx, filtered, identifier)
	}
	return v.Next.ExecuteWrapped(wrappedIn, wrappedOut, provider)
}

func (v *BranchFilter) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	ctx, out, err := v.InputMethod(ctx, in.Node, "in")
	if err != nil {
		return nil, err
	}
	response, err := v.Next.ReadNode(ctx, &tree.ReadNodeRequest{
		Node:              out,
		StatFlags:         in.StatFlags,
		WithExtendedStats: in.WithExtendedStats,
		ObjectStats:       in.ObjectStats,
	}, opts...)
	if err == nil && response.Node != nil {
		_, out2, oE := v.OutputMethod(ctx, response.Node, "in")
		if oE != nil {
			return nil, oE
		}
		response.Node = out2
	}
	return response, err
}

func (v *BranchFilter) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (streamer tree.NodeProvider_ListNodesClient, e error) {
	ctx, out, err := v.InputMethod(ctx, in.Node, "in")
	if err != nil {
		return nil, err
	}
	newReq := proto.Clone(in).(*tree.ListNodesRequest)
	newReq.Node = out
	stream, err := v.Next.ListNodes(ctx, newReq, opts...)
	if err != nil {
		return nil, err
	}
	s := nodes.NewWrappingStreamer(stream.Context())
	go func() {
		defer s.CloseSend()
		for {
			resp, err := stream.Recv()
			if err != nil {
				if !errors.IsStreamFinished(err) {
					_ = s.SendError(err)
				}
				break
			}
			if resp == nil {
				continue
			}
			if _, out, oE := v.OutputMethod(ctx, resp.Node, "in"); oE != nil {
				continue
			} else {
				resp.Node = out
			}
			_ = s.Send(resp)
		}
	}()
	return s, nil
}

func (v *BranchFilter) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...grpc.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {

	ctx, rootPathNode, err := v.InputMethod(ctx, &tree.Node{Path: in.RootPath}, "in")
	if err != nil {
		return nil, err
	}
	newReq := proto.Clone(in).(*tree.StreamChangesRequest)
	newReq.RootPath = rootPathNode.Path
	stream, err := v.Next.StreamChanges(ctx, newReq, opts...)
	if err != nil {
		return nil, err
	}
	s := nodes.NewChangesWrappingStreamer(stream.Context())
	go func() {
		defer s.CloseSend()
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
				if _, out, oE := v.OutputMethod(ctx, event.Target, "in"); oE != nil {
					event.Target = nil
				} else {
					event.Target = out
				}
			}
			if event.Source != nil {
				if _, out, oE := v.OutputMethod(ctx, event.Source, "in"); oE != nil {
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

func (v *BranchFilter) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	ctx, out, err := v.InputMethod(ctx, in.From, "from")
	if err != nil {
		return nil, err
	}
	ctx, outTo, _ := v.InputMethod(ctx, in.To, "to")

	newReq := proto.Clone(in).(*tree.UpdateNodeRequest)
	newReq.From = out
	newReq.To = outTo

	response, err := v.Next.UpdateNode(ctx, newReq, opts...)
	if response != nil && response.Node != nil {
		_, outResp, oE := v.OutputMethod(ctx, response.Node, "to")
		if oE != nil {
			return nil, oE
		}
		response.Node = outResp
	}
	return response, err
}

func (v *BranchFilter) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	ctx, out, err := v.InputMethod(ctx, in.Node, "in")
	if err != nil {
		return nil, err
	}
	newReq := proto.Clone(in).(*tree.DeleteNodeRequest)
	newReq.Node = out
	return v.Next.DeleteNode(ctx, newReq, opts...)
}

func (v *BranchFilter) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	ctx, filtered, err := v.InputMethod(ctx, in.Node, "in")
	if err != nil {
		return nil, err
	}
	newReq := proto.Clone(in).(*tree.CreateNodeRequest)
	newReq.Node = filtered
	response, err := v.Next.CreateNode(ctx, newReq, opts...)
	if err == nil && response != nil && response.Node != nil {
		_, out, oE := v.OutputMethod(ctx, response.Node, "in")
		if oE != nil {
			return nil, oE
		}
		response.Node = out
	}
	return response, err
}

func (v *BranchFilter) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	ctx, filtered, err := v.InputMethod(ctx, node, "in")
	if err != nil {
		return nil, err
	}
	return v.Next.GetObject(ctx, filtered, requestData)
}

func (v *BranchFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	ctx, filtered, err := v.InputMethod(ctx, node, "in")
	if err != nil {
		return models.ObjectInfo{}, err
	}
	return v.Next.PutObject(ctx, filtered, reader, requestData)
}

func (v *BranchFilter) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {

	var outF, outT *tree.Node
	var e error
	ctx, outF, e = v.InputMethod(ctx, from, "from")
	if e != nil {
		return models.ObjectInfo{}, e
	}
	ctx, outT, e = v.InputMethod(ctx, to, "to")
	if e != nil {
		return models.ObjectInfo{}, e
	}

	return v.Next.CopyObject(ctx, outF, outT, requestData)
}

func (v *BranchFilter) MultipartCreate(ctx context.Context, node *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	ctx, filtered, err := v.InputMethod(ctx, node, "in")
	if err != nil {
		return "", err
	}
	return v.Next.MultipartCreate(ctx, filtered, requestData)
}

func (v *BranchFilter) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	ctx, filtered, err := v.InputMethod(ctx, target, "in")
	if err != nil {
		return models.ObjectInfo{}, err
	}
	return v.Next.MultipartComplete(ctx, filtered, uploadID, uploadedParts)
}

func (v *BranchFilter) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {
	ctx, filtered, err := v.InputMethod(ctx, target, "in")
	if err != nil {
		log.Logger(ctx).Error("HANDLER-PATH-ABSTRACT-FILTER - error in InputMethod \n", zap.Error(err), zap.Any("\n#####  context", ctx))
		return models.MultipartObjectPart{}, err
	}
	return v.Next.MultipartPutObjectPart(ctx, filtered, uploadID, partNumberMarker, reader, requestData)
}

func (v *BranchFilter) MultipartAbort(ctx context.Context, node *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	ctx, filtered, err := v.InputMethod(ctx, node, "in")
	if err != nil {
		return err
	}
	return v.Next.MultipartAbort(ctx, filtered, uploadID, requestData)
}

func (v *BranchFilter) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (lpi models.ListObjectPartsResult, er error) {
	ctx, filtered, err := v.InputMethod(ctx, target, "in")
	if err != nil {
		return models.ListObjectPartsResult{}, err
	}
	return v.Next.MultipartListObjectParts(ctx, filtered, uploadID, partNumberMarker, maxParts)
}

func (v *BranchFilter) MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (models.ListMultipartUploadsResult, error) {
	if prefix == "" {
		return models.ListMultipartUploadsResult{}, nil
	}
	target := &tree.Node{Path: prefix}
	ctx, _, err := v.InputMethod(ctx, target, "in")
	if err != nil {
		return models.ListMultipartUploadsResult{}, err
	}
	return v.Next.MultipartList(ctx, prefix, requestData)
}
