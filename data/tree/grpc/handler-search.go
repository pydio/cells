/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

// StreamConvert wraps a Searcher_SearchStream into a NodesProvider_ListNodesStream
type StreamConverter struct {
	ctx     context.Context
	wrapped tree.Searcher_SearchStream
}

func (sc *StreamConverter) SendMsg(i interface{}) error {
	return sc.SendMsg(i)
}
func (sc *StreamConverter) RecvMsg(i interface{}) error {
	return sc.RecvMsg(i)
}
func (sc *StreamConverter) Close() error {
	return sc.wrapped.Close()
}
func (sc *StreamConverter) Send(response *tree.ListNodesResponse) error {
	return sc.wrapped.Send(&tree.SearchResponse{Node: response.GetNode()})
}

// Search implements the SearchServer handler method. It will transform a tree.SearchRequest into an underlying ListNode query
func (s *TreeServer) Search(ctx context.Context, request *tree.SearchRequest, stream tree.Searcher_SearchStream) error {
	q := request.GetQuery()
	if q == nil {
		return fmt.Errorf("request.Query should not be nil")
	}
	if q.Content != "" {
		return fmt.Errorf("this service does not support request.Query.Content")
	}

	listReq := &tree.ListNodesRequest{
		Node:      &tree.Node{},
		Offset:    int64(request.From),
		Recursive: true,
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
	if q.MaxDate > 0 || q.MinDate > 0 {
		var dateParts []string
		if q.MinDate > 0 {
			dateParts = append(dateParts, fmt.Sprintf(">=%d", q.MinDate))
		}
		if q.MaxDate > 0 {
			dateParts = append(dateParts, fmt.Sprintf("<=%d", q.MaxDate))
		}
		listReq.Node.SetMeta("time", dateParts)
	}
	// Filter Size
	if q.MaxSize > 0 || q.MinSize > 0 {
		var sizeParts []string
		if q.MinDate > 0 {
			sizeParts = append(sizeParts, fmt.Sprintf(">=%d", q.MinSize))
		}
		if q.MaxDate > 0 {
			sizeParts = append(sizeParts, fmt.Sprintf("<=%d", q.MaxSize))
		}
		listReq.Node.SetMeta("size", sizeParts)
	}
	// Grep Filename
	if q.FileName != "" {
		listReq.Node.SetMeta("grep", "^"+q.FileName+"$")
	} else if q.Extension != "" {
		ext := strings.Split(q.Extension, "|")
		var greps []string
		for _, x := range ext {
			greps = append(greps, x+"$")
		}
		listReq.Node.SetMeta("grep", strings.Join(greps, "|"))
	}

	log.Logger(ctx).Debug("Sending ListNodeRequest", zap.Any("req", listReq))
	for _, p := range q.PathPrefix {
		listReq.Node.Path = p
		streamer := &StreamConverter{
			ctx:     ctx,
			wrapped: stream,
		}
		e := s.ListNodes(ctx, listReq, streamer)
		if e != nil {
			return e
		}
	}

	return nil
}
