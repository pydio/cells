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

package views

import (
	"context"
	"io"
	"strings"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

// VirtualNodesBrowser is used by admin mode to list virtual nodes instead of their resolved values.
type VirtualNodesBrowser struct {
	AbstractHandler
}

func NewVirtualNodesBrowser() *VirtualNodesBrowser {
	return &VirtualNodesBrowser{}
}

// ReadNode creates a fake node if admin is reading info about a virtual node
func (v *VirtualNodesBrowser) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {

	if virtual, exists := GetVirtualNodesManager().ByPath(in.Node.Path); exists {
		log.Logger(ctx).Debug("Virtual Node Browser, Found", zap.Any("found", virtual))
		return &tree.ReadNodeResponse{Node: virtual}, nil
	}
	return v.next.ReadNode(ctx, in, opts...)

}

// ListNodes Append virtual nodes to the datasources list if admin is listing the root of the tree
func (v *VirtualNodesBrowser) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (streamer tree.NodeProvider_ListNodesClient, e error) {

	vManager := GetVirtualNodesManager()
	if virtual, exists := vManager.ByPath(in.Node.Path); exists {
		log.Logger(ctx).Debug("Virtual Node Browser, Found, send no children", zap.Any("found", virtual))
		s := NewWrappingStreamer()
		defer s.Close()
		return s, nil
	}

	if strings.Trim(in.Node.Path, "/") != "" {
		return v.next.ListNodes(ctx, in, opts...)
	}

	stream, err := v.next.ListNodes(ctx, in, opts...)
	if err != nil {
		return nil, err
	}
	s := NewWrappingStreamer()
	go func() {
		vManager.Load(true)
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
			s.Send(resp)
		}
		for _, n := range vManager.ListNodes() {
			s.Send(&tree.ListNodesResponse{Node: n})
		}
	}()
	return s, nil

}
