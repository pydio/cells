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

package virtual

import (
	"context"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

func WithBrowser() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if options.BrowseVirtualNodes {
			options.Wrappers = append(options.Wrappers, NewVirtualNodesBrowser())
		}
	}
}

// BrowserHandler is used by admin mode to list virtual nodes instead of their resolved values.
type BrowserHandler struct {
	abstract.Handler
}

func (v *BrowserHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	v.AdaptOptions(c, options)
	return v
}

func NewVirtualNodesBrowser() *BrowserHandler {
	return &BrowserHandler{}
}

// ReadNode creates a fake node if admin is reading info about a virtual node
func (v *BrowserHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {

	if virtual, exists := abstract.GetVirtualNodesManager(v.RuntimeCtx).ByPath(in.Node.Path); exists {
		log.Logger(ctx).Debug("Virtual Node Browser, Found", zap.Any("found", virtual))
		return &tree.ReadNodeResponse{Node: virtual}, nil
	}
	return v.Next.ReadNode(ctx, in, opts...)

}

// ListNodes Append virtual nodes to the datasources list if admin is listing the root of the tree
func (v *BrowserHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (streamer tree.NodeProvider_ListNodesClient, e error) {

	vManager := abstract.GetVirtualNodesManager(ctx)
	if virtual, exists := vManager.ByPath(in.Node.Path); exists {
		log.Logger(ctx).Debug("Virtual Node Browser, Found, send no children", zap.Any("found", virtual))
		s := nodes.NewWrappingStreamer(ctx)
		defer s.CloseSend()
		return s, nil
	}

	if strings.Trim(in.Node.Path, "/") != "" {
		return v.Next.ListNodes(ctx, in, opts...)
	}

	stream, err := v.Next.ListNodes(ctx, in, opts...)
	if err != nil {
		return nil, err
	}
	s := nodes.NewWrappingStreamer(ctx)
	go func() {
		vManager.Load(true)
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
			s.Send(resp)
		}
		for _, n := range vManager.ListNodes() {
			s.Send(&tree.ListNodesResponse{Node: n})
		}
	}()
	return s, nil

}
