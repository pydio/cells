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

package grpc

import (
	"context"
	"fmt"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

// StreamConverter wraps a Searcher_SearchStream into a NodesProvider_ListNodesStream
type StreamConverter struct {
	ctx     context.Context
	wrapped tree.Searcher_SearchServer
}

func (sc *StreamConverter) SetHeader(md metadata.MD) error {
	return sc.wrapped.SetHeader(md)
}

func (sc *StreamConverter) SendHeader(md metadata.MD) error {
	return sc.wrapped.SendHeader(md)
}

func (sc *StreamConverter) SetTrailer(md metadata.MD) {
	sc.wrapped.SetTrailer(md)
}

func (sc *StreamConverter) Context() context.Context {
	return sc.wrapped.Context()
}

func (sc *StreamConverter) SendMsg(i interface{}) error {
	return sc.wrapped.SendMsg(i)
}

func (sc *StreamConverter) RecvMsg(i interface{}) error {
	return sc.wrapped.RecvMsg(i)
}

func (sc *StreamConverter) Send(response *tree.ListNodesResponse) error {
	return sc.wrapped.Send(&tree.SearchResponse{
		Data: &tree.SearchResponse_Node{Node: response.GetNode()},
	})
}

// Search implements the SearchServer handler method. It will transform a tree.SearchRequest into an underlying ListNode query
func (s *TreeServer) Search(request *tree.SearchRequest, stream tree.Searcher_SearchServer) error {
	ctx := stream.Context()
	q := request.GetQuery()
	if q == nil {
		return errors.New("request.Query should not be nil")
	}
	if q.Content != "" {
		return errors.New("this service does not support request.Query.Content")
	}

	listReq := &tree.ListNodesRequest{
		Node:        &tree.Node{},
		Offset:      int64(request.From),
		SortField:   request.GetSortField(),
		SortDirDesc: request.GetSortDirDesc(),
		Recursive:   true,
	}
	if request.Size > 0 {
		listReq.Limit = int64(request.Size)
	}
	if len(q.PathPrefix) == 0 {
		q.PathPrefix = []string{"/"}
	}
	// Filter Node Type
	listReq.FilterType = q.Type
	// Filter Date
	if e := q.ParseDurationDate(); e != nil {
		return e
	}
	if q.MaxDate > 0 || q.MinDate > 0 {
		var dateParts []string
		if q.MinDate > 0 {
			dateParts = append(dateParts, fmt.Sprintf(">=%d", q.MinDate))
		}
		if q.MaxDate > 0 {
			dateParts = append(dateParts, fmt.Sprintf("<=%d", q.MaxDate))
		}
		listReq.Node.MustSetMeta(tree.MetaFilterTime, dateParts)
	}
	// Filter Size
	if q.MaxSize > 0 || q.MinSize > 0 {
		var sizeParts []string
		if q.MinSize > 0 {
			sizeParts = append(sizeParts, fmt.Sprintf(">=%d", q.MinSize))
		}
		if q.MaxSize > 0 {
			sizeParts = append(sizeParts, fmt.Sprintf("<=%d", q.MaxSize))
		}
		listReq.Node.MustSetMeta(tree.MetaFilterSize, sizeParts)
	}
	// Grep Filename
	if q.FileName != "" {
		g := strings.Trim(q.FileName, "*")
		var left, right, or bool
		if !strings.HasPrefix(q.FileName, "*") {
			g = "^" + g
			left = true
		}
		if !strings.HasSuffix(q.FileName, "*") {
			g = g + "$"
			right = true
		}
		if strings.Contains(q.FileName, "|") {
			g = q.FileName
			or = true
		}
		if !left || !right || or {
			g = "(?i)" + g // Make case insensitive
		}
		if q.Not {
			listReq.Node.MustSetMeta(tree.MetaFilterNoGrep, g)
		} else {
			listReq.Node.MustSetMeta(tree.MetaFilterGrep, g)
		}
	} else if q.Extension != "" {
		ext := strings.Split(q.Extension, "|")
		var greps []string
		for _, x := range ext {
			greps = append(greps, "(?i)"+x+"$")
		}
		if q.Not {
			listReq.Node.MustSetMeta(tree.MetaFilterNoGrep, strings.Join(greps, "|"))
		} else {
			listReq.Node.MustSetMeta(tree.MetaFilterGrep, strings.Join(greps, "|"))
		}
	}
	if q.PathDepth > 0 {
		listReq.Node.MustSetMeta(tree.MetaFilterDepth, q.PathDepth)
	} else if q.PathDepth == -1 {
		listReq.Recursive = false
	}
	if q.ETag != "" {
		listReq.Node.MustSetMeta(tree.MetaFilterETag, q.ETag)
	}

	for _, p := range q.PathPrefix {
		listReq.Node.Path = p
		streamer := &StreamConverter{
			ctx:     ctx,
			wrapped: stream,
		}
		log.Logger(ctx).Debug("Tree.Search - sending ListNodeRequest", zap.Any("req", listReq))
		e := s.ListNodes(listReq, streamer)
		if e != nil {
			return e
		}
	}

	return nil
}
