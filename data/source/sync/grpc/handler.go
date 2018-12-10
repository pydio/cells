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
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/object"
	protosync "github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	context2 "github.com/pydio/cells/common/utils/context"
	synccommon "github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/filters"
	"github.com/pydio/cells/data/source/sync/lib/task"
)

// Handler structure
type Handler struct {
	IndexClient  tree.NodeProviderClient
	S3client     synccommon.PathSyncTarget
	SyncTask     *task.Sync
	SyncConfig   *object.DataSource
	ObjectConfig *object.MinioConfig
}

// CreateNode Forwards to Index
func (s *Handler) CreateNode(ctx context.Context, req *tree.CreateNodeRequest, resp *tree.CreateNodeResponse) error {

	e := s.S3client.CreateNode(ctx, req.Node, req.UpdateIfExists)
	if e != nil {
		return e
	}
	resp.Node = req.Node
	return nil
}

// UpdateNode Forwards to S3
func (s *Handler) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest, resp *tree.UpdateNodeResponse) error {

	e := s.S3client.MoveNode(ctx, req.From.Path, req.To.Path)
	if e != nil {
		resp.Success = false
		return e
	}
	resp.Success = true
	return nil
}

// DeleteNode Forwards to S3
func (s *Handler) DeleteNode(ctx context.Context, req *tree.DeleteNodeRequest, resp *tree.DeleteNodeResponse) error {

	e := s.S3client.DeleteNode(ctx, req.Node.Path)
	if e != nil {
		resp.Success = false
		return e
	}
	resp.Success = true
	return nil
}

// ReadNode Forwards to Index
func (s *Handler) ReadNode(ctx context.Context, req *tree.ReadNodeRequest, resp *tree.ReadNodeResponse) error {

	r, e := s.IndexClient.ReadNode(ctx, req)
	if e != nil {
		return e
	}
	resp.Success = true
	resp.Node = r.Node
	return nil

}

// ListNodes Forward to index
func (s *Handler) ListNodes(ctx context.Context, req *tree.ListNodesRequest, resp tree.NodeProvider_ListNodesStream) error {

	client, e := s.IndexClient.ListNodes(ctx, req)
	if e != nil {
		return e
	}
	defer client.Close()
	for {
		nodeResp, re := client.Recv()
		if nodeResp == nil {
			break
		}
		if re != nil {
			return e
		}
		se := resp.Send(nodeResp)
		if se != nil {
			return e
		}
	}

	return nil
}

// TriggerResync sets 2 servers in sync
func (s *Handler) TriggerResync(c context.Context, req *protosync.ResyncRequest, resp *protosync.ResyncResponse) error {

	statusChan := make(chan filters.BatchProcessStatus)
	doneChan := make(chan bool)
	fullLog := &jobs.ActionLog{
		OutputMessage: &jobs.ActionMessage{},
	}

	if req.Task != nil {
		subCtx := context2.WithUserNameMetadata(context.Background(), common.PYDIO_SYSTEM_USERNAME)

		theTask := req.Task
		taskClient := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, defaults.NewClient(client.Retries(3)))

		theTask.StatusMessage = "Starting"
		theTask.Progress = 0
		theTask.Status = jobs.TaskStatus_Running
		theTask.StartTime = int32(time.Now().Unix())
		theTask.ActionsLogs = append(theTask.ActionsLogs, fullLog)
		fullLog.OutputMessage.AppendOutput(&jobs.ActionOutput{
			StringBody: "Starting Resync",
		})
		taskClient.PutTask(subCtx, &jobs.PutTaskRequest{Task: theTask})

		go func() {
			defer close(statusChan)
			defer close(doneChan)
			for {
				select {
				case status := <-statusChan:
					theTask.StatusMessage = status.StatusString
					fullLog.OutputMessage.AppendOutput(&jobs.ActionOutput{
						StringBody: status.StatusString,
					})
					theTask.Progress = status.Progress
					theTask.Status = jobs.TaskStatus_Running
					_, e := taskClient.PutTask(subCtx, &jobs.PutTaskRequest{Task: theTask})
					if e != nil {
						log.Logger(subCtx).Error("Could not update sync task", zap.Any("s", status), zap.Error(e))
					}
				case <-doneChan:
					theTask := req.Task
					theTask.StatusMessage = "Complete"
					theTask.Progress = 1
					theTask.EndTime = int32(time.Now().Unix())
					theTask.Status = jobs.TaskStatus_Finished
					fullLog.OutputMessage.AppendOutput(&jobs.ActionOutput{
						StringBody: "Sync complete",
					})
					_, e := taskClient.PutTask(subCtx, &jobs.PutTaskRequest{Task: theTask})
					if e != nil {
						log.Logger(subCtx).Error("Could not update sync task", zap.Error(e))
					}
					return
				}
			}
		}()
	}

	diff, e := s.SyncTask.Resync(c, req.DryRun, statusChan, doneChan)
	if e != nil {
		if req.Task != nil {
			theTask := req.Task
			taskClient := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, defaults.NewClient(client.Retries(3)))
			theTask.StatusMessage = "Error"
			theTask.Progress = 1
			theTask.EndTime = int32(time.Now().Unix())
			theTask.Status = jobs.TaskStatus_Error
			fullLog.OutputMessage.AppendOutput(&jobs.ActionOutput{
				ErrorString: e.Error(),
			})
			theTask.ActionsLogs = append(theTask.ActionsLogs, fullLog)
			taskClient.PutTask(c, &jobs.PutTaskRequest{Task: theTask})
		}
		return e
	}
	data, _ := json.Marshal(diff)
	if e == nil {
		resp.JsonDiff = string(data)
	}
	resp.Success = true
	return nil
}

// Implements the S3Endpoint Interface by using the real object configs + the local datasource configs for bucket and base folder
func (s *Handler) GetDataSourceConfig(ctx context.Context, request *object.GetDataSourceConfigRequest, response *object.GetDataSourceConfigResponse) error {

	s.SyncConfig.ObjectsHost = s.ObjectConfig.RunningHost
	s.SyncConfig.ObjectsPort = s.ObjectConfig.RunningPort
	s.SyncConfig.ObjectsSecure = s.ObjectConfig.RunningSecure
	s.SyncConfig.ApiKey = s.ObjectConfig.ApiKey
	s.SyncConfig.ApiSecret = s.ObjectConfig.ApiSecret

	response.DataSource = s.SyncConfig

	return nil
}

// CleanResourcesBeforeDelete gracefully stops the sync task and remove the associated resync job
func (s *Handler) CleanResourcesBeforeDelete(ctx context.Context, request *object.CleanResourcesRequest, response *object.CleanResourcesResponse) error {

	s.SyncTask.Shutdown()

	serviceName := servicecontext.GetServiceName(ctx)
	dsName := strings.TrimPrefix(serviceName, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_)
	taskClient := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, defaults.NewClient())
	log.Logger(ctx).Info("Removing job for datasource " + dsName)
	_, e := taskClient.DeleteJob(ctx, &jobs.DeleteJobRequest{
		JobID: "resync-ds-" + dsName,
	})
	return e

}
