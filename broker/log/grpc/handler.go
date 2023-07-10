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
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"io"
	"strconv"
	"strings"
	"time"

	"github.com/pydio/cells/v4/common/client/grpc"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/broker/log"
	"github.com/pydio/cells/v4/common"
	log2 "github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
	proto "github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/service/errors"
)

// Handler is the gRPC interface for the log service.
type Handler struct {
	sync.UnimplementedSyncEndpointServer
	proto.UnimplementedLogRecorderServer
	RuntimeCtx  context.Context
	Repo        log.MessageRepository
	HandlerName string
}

func (h *Handler) Name() string {
	return h.HandlerName
}

// PutLog retrieves the log messages from the proto stream and stores them in the index.
func (h *Handler) PutLog(stream proto.LogRecorder_PutLogServer) error {

	var logCount int32
	for {
		line, err := stream.Recv()
		if err == io.EOF {
			return nil
		}

		if err != nil {
			return err
		}
		logCount++

		h.Repo.PutLog(stream.Context(), line)
	}
}

// ListLogs is a simple gateway from protobuf to the indexer search engine.
func (h *Handler) ListLogs(req *proto.ListLogRequest, stream proto.LogRecorder_ListLogsServer) error {

	q := req.GetQuery()
	p := req.GetPage()
	s := req.GetSize()

	r, err := h.Repo.ListLogs(stream.Context(), q, p, s)

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

// DeleteLogs removes logs based on a ListLogRequest
func (h *Handler) DeleteLogs(ctx context.Context, req *proto.ListLogRequest) (*proto.DeleteLogsResponse, error) {

	d, e := h.Repo.DeleteLogs(ctx, req.Query)
	if e != nil {
		return nil, e
	}
	return &proto.DeleteLogsResponse{
		Deleted: d,
	}, nil

}

// AggregatedLogs retrieves aggregated figures from the indexer to generate charts and reports.
func (h *Handler) AggregatedLogs(req *proto.TimeRangeRequest, stream proto.LogRecorder_AggregatedLogsServer) error {
	return errors.InternalServerError("not.implemented", "cannot aggregate syslogs")
}

// TriggerResync uses the request.Path as parameter. If nothing is passed, it reads all the logs from index and
// reconstructs a new index entirely. If truncate/{int64} is passed, it truncates the log to the given size (or closer)
func (h *Handler) TriggerResync(ctx context.Context, request *sync.ResyncRequest) (*sync.ResyncResponse, error) {

	var l log2.ZapLogger
	var closeTask func(e error)
	if request.Task != nil {
		l = log2.TasksLogger(ctx)
		theTask := request.Task
		theTask.StartTime = int32(time.Now().Unix())
		closeTask = func(e error) {
			taskClient := jobs.NewJobServiceClient(grpc.GetClientConnFromCtx(h.RuntimeCtx, common.ServiceJobs))
			theTask.EndTime = int32(time.Now().Unix())
			if e != nil {
				theTask.StatusMessage = "Error " + e.Error()
				theTask.Status = jobs.TaskStatus_Error
			} else {
				theTask.StatusMessage = "Done"
				theTask.Status = jobs.TaskStatus_Finished
			}
			_, err := taskClient.PutTask(context.Background(), &jobs.PutTaskRequest{Task: theTask})
			if err != nil {
				fmt.Println("Cannot post task!", err)
			}
		}
	} else {
		closeTask = func(e error) {}
	}

	if strings.HasPrefix(request.Path, "truncate/") {
		strSize := strings.TrimPrefix(request.Path, "truncate/")
		var er error
		if maxSize, e := strconv.ParseInt(strSize, 10, 64); e == nil {
			er = h.Repo.Truncate(ctx, maxSize, l)
		} else {
			er = fmt.Errorf("wrong format for truncate (use bytesize)")
		}
		closeTask(er)
		return &sync.ResyncResponse{}, er
	}

	c := servicecontext.WithServiceName(context.Background(), servicecontext.GetServiceName(ctx))
	go func() {
		e := h.Repo.Resync(c, l)
		if e != nil {
			if l != nil {
				l.Error("Error while resyncing: ", zap.Error(e))
			} else {
				fmt.Println("Error while resyncing: " + e.Error())
			}
		}
		closeTask(e)
	}()

	return &sync.ResyncResponse{}, nil
}
