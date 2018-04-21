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

package grpc

import (
	"io"
	"fmt"
	"context"

	"github.com/go-openapi/errors"

	"github.com/pydio/cells/broker/log"
	proto "github.com/pydio/cells/common/proto/log"
)

// Handler is the gRPC interface for the log service
type Handler struct {
	Repo log.MessageRepository
}

// PutLog retrieves the log messages from the proto stream and stores them in the index.
func (h *Handler) PutLog(ctx context.Context, stream proto.LogRecorder_PutLogStream) error {

	var logCount int32
	for {
		line, err := stream.Recv()
		if err == io.EOF {
			return stream.Close()
		}

		if err != nil {
			return err
		}
		logCount++

		h.Repo.PutLog(line.GetMessage())
	}
}

// ListLogs is a simple gateway from protobuf to the indexer search engine.
func (h *Handler) ListLogs(ctx context.Context, req *proto.ListLogRequest, stream proto.LogRecorder_ListLogsStream) error {

	fmt.Println("Core Log Handler, listing", req, h)
	q := req.GetQuery()
	p := req.GetPage()
	s := req.GetSize()

	r, err := h.Repo.ListLogs(q, p, s)

	if err != nil {
		return err
	}

	for rr := range r {

		stream.Send(&proto.ListLogResponse{
			LogMessage: rr.LogMessage,
		})
	}
	return nil
}

// AggregatedLogs retrieves aggregated figures from the indexer to generate charts and reports.
func (h *Handler) AggregatedLogs(ctx context.Context, req *proto.TimeRangeRequest, stream proto.LogRecorder_AggregatedLogsStream) error {
	return errors.NotImplemented("cannot aggregate syslogs")
}
