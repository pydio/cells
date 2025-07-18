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
	"strings"
	sync3 "sync"
	"time"

	"go.uber.org/multierr"
	"go.uber.org/zap"
	"google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/jobsc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/server"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/data/source"
	sync2 "github.com/pydio/cells/v5/data/source/sync"
	"github.com/pydio/cells/v5/data/source/sync/clients"
	"github.com/pydio/cells/v5/scheduler/tasks"
)

type Handler struct {
	grpc_health_v1.HealthServer
	PresetSync *Syncer
	*source.Resolver[*Syncer]

	tree.UnimplementedNodeProviderServer
	tree.UnimplementedNodeReceiverServer
	tree.UnimplementedNodeChangesReceiverStreamerServer
	sync.UnimplementedSyncEndpointServer
	object.UnimplementedDataSourceEndpointServer
	object.UnimplementedResourceCleanerEndpointServer
	server.UnimplementedReadyzServer
}

func (h *Handler) getSyncer(ctx context.Context) (*Syncer, bool) {
	if h.PresetSync != nil {
		return h.PresetSync, true
	} else {
		h, er := h.Resolve(ctx)
		return h, er == nil
	}
}

// Ready implements a custom Readyness healthcheck API
func (h *Handler) Ready(ctx context.Context, req *server.ReadyCheckRequest) (*server.ReadyCheckResponse, error) {
	hsResp, er := h.HealthServer.Check(ctx, req.HealthCheckRequest)
	if er != nil {
		return nil, errors.Tag(er, errors.HealthCheckError)
	}
	resp := &server.ReadyCheckResponse{
		HealthCheckResponse: hsResp,
		ReadyStatus:         server.ReadyStatus_NotReady,
		Components:          make(map[string]*server.ComponentStatus, 3),
	}
	if hsResp.Status != grpc_health_v1.HealthCheckResponse_SERVING {
		return resp, nil
	}
	cLock := &sync3.Mutex{}
	callback := func(sName string, status bool, detail string) {
		st := &server.ComponentStatus{Details: detail}
		if status {
			st.ReadyStatus = server.ReadyStatus_Ready
		} else {
			st.ReadyStatus = server.ReadyStatus_NotReady
		}
		cLock.Lock()
		defer cLock.Unlock()
		resp.Components[sName] = st
	}
	conf, er := h.Lookup(ctx)
	if er != nil {
		resp.ReadyStatus = server.ReadyStatus_Unknown
		return resp, errors.Tag(er, errors.HealthCheckError)
	}
	sc, e := conf.Config(ctx)
	if e != nil {
		resp.ReadyStatus = server.ReadyStatus_Unknown
		return resp, errors.Tag(e, errors.HealthCheckError)
	}
	_, _, er = clients.CheckSubServices(ctx, sc, callback)
	if er == nil {
		resp.ReadyStatus = server.ReadyStatus_Ready
	}

	return resp, errors.Tag(er, errors.HealthCheckError)
}

// TriggerResync sets 2 servers in sync
func (h *Handler) TriggerResync(c context.Context, req *sync.ResyncRequest) (*sync.ResyncResponse, error) {

	sh, ok := h.getSyncer(c)
	if !ok {
		return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource in context")
	}

	resp := &sync.ResyncResponse{}

	var statusChan chan model.Status
	doneChan := make(chan interface{})
	blocker := make(chan interface{})

	if req.Task != nil {
		statusChan = make(chan model.Status)

		subCtx := context.WithoutCancel(c)
		subCtx = propagator.WithUserNameMetadata(subCtx, common.PydioContextUserKey, common.PydioSystemUsername)

		theTask := req.Task
		autoClient := tasks.NewTaskReconnectingClient(subCtx)
		taskChan := make(chan interface{}, 1000)
		autoClient.StartListening(taskChan)

		theTask.StatusMessage = "Starting"
		theTask.HasProgress = true
		theTask.Progress = 0
		theTask.Status = jobs.TaskStatus_Running
		theTask.StartTime = int32(time.Now().Unix())

		log.TasksLogger(c).Info("Starting Resync")
		taskChan <- theTask

		go func() {
			defer func() {
				close(doneChan)
				<-time.After(2 * time.Second)
				close(statusChan)
				close(blocker)
				autoClient.Stop()
			}()
			for {
				select {
				case status := <-statusChan:
					ta := proto.Clone(theTask).(*jobs.Task)
					ta.StatusMessage = status.String()
					ta.HasProgress = true
					ta.Progress = status.Progress()
					ta.Status = jobs.TaskStatus_Running
					if status.IsError() && status.Error() != nil {
						log.TasksLogger(c).Error(status.String(), zap.Error(status.Error()))
					} else if status.String() != "" {
						log.TasksLogger(c).Info(status.String())
					}
					taskChan <- ta
				case data := <-doneChan:
					ta := proto.Clone(theTask).(*jobs.Task)
					ta.HasProgress = true
					ta.Progress = 1
					ta.StatusMessage = "Resync Completed"
					ta.EndTime = int32(time.Now().Unix())
					//ta.Status = jobs.TaskStatus_Finished
					if patch, ok := data.(merger.Patch); ok {
						if errs, has := patch.HasErrors(); has {
							ta.StatusMessage = "Error: " + errs[0].Error()
							ta.Status = jobs.TaskStatus_Error
							log.TasksLogger(c).Info("Sync finished on error : " + errs[0].Error())
						} else {
							log.TasksLogger(c).Info("Sync completed")
						}
					} else {
						log.TasksLogger(c).Info("Sync completed")
					}
					taskChan <- ta
					return
				}
			}
		}()
	} else {
		go func() {
			select {
			case <-doneChan:
				close(blocker)
			}
			close(doneChan)
		}()
	}

	// First trigger a Resync on index, to clean potential issues
	if _, err := sh.IndexClientClean.TriggerResync(c, req); err != nil {
		if req.Task != nil {
			log.TasksLogger(c).Error("Could not run index Lost+found "+err.Error(), zap.Error(err))
		} else {
			log.Logger(c).Error("Could not run index Lost+found "+err.Error(), zap.Error(err))
		}
	}

	// Context extends request Context, which allows sync.Run cancellation from within the scheduler.
	// Internal context used for SessionData is re-extended from context.Background
	bg := propagator.WithUserNameMetadata(c, common.PydioContextUserKey, common.PydioSystemUsername)
	bg = propagator.ForkOneKey(runtime.ServiceNameKey, bg, c)
	/*
		if s, o := servicecontext.SpanFromContext(c); o {
			bg = servicecontext.WithSpan(bg, s)
		}
	*/

	var result model.Stater
	var err error
	if sh.SyncConfig.FlatStorage {
		pathParts := strings.Split(strings.Trim(req.GetPath(), "/"), "/")
		if len(pathParts) == 2 {
			dir := pathParts[0]
			snapName := pathParts[1]
			result, err = sh.FlatSyncSnapshot(bg, sh.SyncConfig, dir, snapName, statusChan, doneChan)
		} else if len(pathParts) == 1 && pathParts[0] == "init" {
			result, err = sh.FlatScanEmpty(bg, statusChan, doneChan)
		} else {
			// Nothing to do, just close doneChan
			if doneChan != nil {
				doneChan <- true
			}

			resp.Success = true
			return resp, nil
		}
	} else {
		sh.StMux.Lock()
		sh.SyncTask.SetupEventsChan(statusChan, doneChan, nil)
		result, err = sh.SyncTask.Run(bg, req.DryRun, false)
		sh.StMux.Unlock()
	}

	if err != nil {
		if req.Task != nil {
			theTask := req.Task
			taskClient := jobsc.JobServiceClient(sh.GlobalCtx) //jobs.NewJobServiceClient(grpccli.ResolveConn(s.GlobalCtx, common.ServiceJobs))
			theTask.StatusMessage = "Error"
			theTask.HasProgress = true
			theTask.Progress = 1
			theTask.EndTime = int32(time.Now().Unix())
			theTask.Status = jobs.TaskStatus_Error
			log.TasksLogger(c).Error("Error during sync task", zap.Error(err))
			_, _ = taskClient.PutTask(c, &jobs.PutTaskRequest{Task: theTask})
		}
		return nil, err
	} else if result != nil {
		if blocker != nil {
			<-blocker
		}
		data, _ := jsonx.Marshal(result.Stats())
		resp.JsonDiff = string(data)
		resp.Success = true
		return resp, nil
	} else {
		return nil, errors.New("empty result")
	}
}

// GetDataSourceConfig implements the S3Endpoint Interface by using the real object configs + the local datasource configs for bucket and base folder.
func (h *Handler) GetDataSourceConfig(ctx context.Context, _ *object.GetDataSourceConfigRequest) (*object.GetDataSourceConfigResponse, error) {

	sh, ok := h.getSyncer(ctx)
	if !ok {
		return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource in context")
	}

	if sh.SyncConfig == nil {
		return nil, errors.WithMessage(errors.StatusServiceUnavailable, "syncConfig not initialized yet")
	}
	sh.SyncConfig.ObjectsHost = sh.ObjectConfig.RunningHost
	sh.SyncConfig.ObjectsPort = sh.ObjectConfig.RunningPort
	sh.SyncConfig.ObjectsSecure = sh.ObjectConfig.RunningSecure
	sh.SyncConfig.ApiKey = sh.ObjectConfig.ApiKey
	sh.SyncConfig.ApiSecret = sh.ObjectConfig.ApiSecret

	return &object.GetDataSourceConfigResponse{
		DataSource: sh.SyncConfig,
	}, nil
}

// CleanResourcesBeforeDelete gracefully stops the sync task and remove the associated resync job
func (h *Handler) CleanResourcesBeforeDelete(ctx context.Context, _ *object.CleanResourcesRequest) (*object.CleanResourcesResponse, error) {
	sh, ok := h.getSyncer(ctx)
	if !ok {
		return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource in context")
	}

	response := &object.CleanResourcesResponse{}
	sh.StMux.Lock()
	sh.SyncTask.Shutdown()
	sh.StMux.Unlock()

	var mm []string
	var ee []error

	if dao, er := manager.Resolve[sync2.DAO](ctx); er == nil {
		if m, e := dao.CleanResourcesOnDeletion(ctx); e != nil {
			ee = append(ee, e)
		} else {
			mm = append(mm, m)
		}
	}

	serviceName := runtime.GetServiceName(ctx)
	dsName := strings.TrimPrefix(serviceName, common.ServiceGrpcNamespace_+common.ServiceDataSync_)
	taskClient := jobsc.JobServiceClient(ctx)
	log.Logger(ctx).Info("Removing job for datasource " + dsName)
	if _, err := taskClient.DeleteJob(ctx, &jobs.DeleteJobRequest{
		JobID: "resync-ds-" + dsName,
	}); err != nil {
		ee = append(ee, err)
	} else {
		mm = append(mm, "Removed associated job for datasource")
	}
	if me := multierr.Combine(ee...); me != nil {
		response.Success = false
		return nil, me
	} else if len(mm) > 0 {
		response.Success = true
		response.Message = strings.Join(mm, ", ")
		return response, nil
	}

	return response, nil
}

// CreateNode Forwards to Index
func (h *Handler) CreateNode(ctx context.Context, req *tree.CreateNodeRequest) (*tree.CreateNodeResponse, error) {

	sh, ok := h.getSyncer(ctx)
	if !ok {
		return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource in context")
	}

	resp := &tree.CreateNodeResponse{}
	err := sh.S3client.(model.PathSyncTarget).CreateNode(ctx, req.Node, req.UpdateIfExists)
	if err != nil {
		return nil, err
	}
	resp.Node = req.Node
	return resp, nil
}

// UpdateNode Forwards to S3
func (h *Handler) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest) (*tree.UpdateNodeResponse, error) {

	sh, ok := h.getSyncer(ctx)
	if !ok {
		return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource in context")
	}

	resp := &tree.UpdateNodeResponse{}
	err := sh.S3client.(model.PathSyncTarget).MoveNode(ctx, req.From.Path, req.To.Path)
	if err != nil {
		resp.Success = false
		return resp, err
	}
	resp.Success = true
	return resp, nil
}

// DeleteNode Forwards to S3
func (h *Handler) DeleteNode(ctx context.Context, req *tree.DeleteNodeRequest) (*tree.DeleteNodeResponse, error) {
	sh, ok := h.getSyncer(ctx)
	if !ok {
		return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource in context")
	}

	resp := &tree.DeleteNodeResponse{}
	err := sh.S3client.(model.PathSyncTarget).DeleteNode(ctx, req.Node.Path)
	if err != nil {
		resp.Success = false
		return resp, err
	}
	resp.Success = true
	return resp, nil
}

// ReadNode Forwards to Index
func (h *Handler) ReadNode(ctx context.Context, req *tree.ReadNodeRequest) (*tree.ReadNodeResponse, error) {

	sh, ok := h.getSyncer(ctx)
	if !ok {
		return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource in context")
	}

	resp := &tree.ReadNodeResponse{}
	r, err := sh.IndexClientRead.ReadNode(ctx, req)
	if err != nil {
		return nil, err
	}
	resp.Success = true
	resp.Node = r.Node
	return resp, nil

}

// ListNodes Forward to index
func (h *Handler) ListNodes(req *tree.ListNodesRequest, resp tree.NodeProvider_ListNodesServer) error {

	sh, ok := h.getSyncer(resp.Context())
	if !ok {
		return errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource in context")
	}

	ctx := resp.Context()
	client, err := sh.IndexClientRead.ListNodes(ctx, req)
	if err != nil {
		return err
	}
	defer client.CloseSend()
	for {
		nodeResp, re := client.Recv()
		if nodeResp == nil {
			break
		}
		if re != nil {
			return re
		}
		se := resp.Send(nodeResp)
		if se != nil {
			return se
		}
	}

	return nil
}

// PostNodeChanges receives NodeChangesEvents, to be used with FallbackWatcher
func (h *Handler) PostNodeChanges(server tree.NodeChangesReceiverStreamer_PostNodeChangesServer) error {
	sh, ok := h.getSyncer(server.Context())
	if !ok {
		return errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource in context")
	}
	for {
		event, err := server.Recv()
		if err != nil {
			return err
		}
		if sh.ChangeEventsFallback != nil {
			sh.ChangeEventsFallback <- event
		}
	}

}
