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
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	config2 "github.com/pydio/go-os/config"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/object"
	protosync "github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/cells/data/source/sync"
	synccommon "github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/endpoints"
	"github.com/pydio/cells/data/source/sync/lib/filters"
	"github.com/pydio/cells/data/source/sync/lib/task"
)

// Handler structure
type Handler struct {
	globalCtx context.Context
	dsName    string

	IndexClient  tree.NodeProviderClient
	S3client     synccommon.PathSyncTarget
	syncTask     *task.Sync
	SyncConfig   *object.DataSource
	ObjectConfig *object.MinioConfig

	watcher    config2.Watcher
	reloadChan chan bool
}

func NewHandler(ctx context.Context, datasource string) (*Handler, error) {
	h := &Handler{
		globalCtx: ctx,
		dsName:    datasource,
	}
	var syncConfig *object.DataSource
	if err := servicecontext.ScanConfig(ctx, &syncConfig); err != nil {
		return nil, err
	}
	e := h.initSync(syncConfig)
	return h, e
}

func (s *Handler) Start() {
	s.syncTask.Start(s.globalCtx)
	go s.watchConfigs()
}

func (s *Handler) Stop() {
	s.syncTask.Shutdown()
	if s.watcher != nil {
		s.watcher.Stop()
	}
}

func (s *Handler) initSync(syncConfig *object.DataSource) error {

	ctx := s.globalCtx
	datasource := s.dsName

	var minioConfig *object.MinioConfig
	service.Retry(func() error {
		log.Logger(ctx).Debug("Sync " + datasource + " - Try to contact Objects")
		cli := object.NewObjectsEndpointClient(registry.GetClient(common.SERVICE_DATA_OBJECTS_ + syncConfig.ObjectsServiceName))
		resp, err := cli.GetMinioConfig(ctx, &object.GetMinioConfigRequest{})
		if err != nil {
			log.Logger(ctx).Debug(common.SERVICE_DATA_OBJECTS_ + syncConfig.ObjectsServiceName + " not yet available")
			return err
		}
		minioConfig = resp.MinioConfig
		return nil
	}, 3*time.Second, 50*time.Second)

	if minioConfig == nil {
		return fmt.Errorf("objects not reachable")
	}

	var source synccommon.PathSyncTarget
	if syncConfig.Watch {
		return fmt.Errorf("datasource watch is not implemented yet")
	} else {
		s3client, errs3 := endpoints.NewS3Client(ctx,
			minioConfig.BuildUrl(), minioConfig.ApiKey, minioConfig.ApiSecret, syncConfig.ObjectsBucket, syncConfig.ObjectsBaseFolder)
		if errs3 != nil {
			return errs3
		}
		normalizeS3, _ := strconv.ParseBool(syncConfig.StorageConfiguration["normalize"])
		if normalizeS3 {
			s3client.ServerRequiresNormalization = true
		}
		source = s3client
	}

	indexName, indexClient := registry.GetClient(common.SERVICE_DATA_INDEX_ + datasource)
	indexClientWrite := tree.NewNodeReceiverClient(indexName, indexClient)
	indexClientRead := tree.NewNodeProviderClient(indexName, indexClient)
	sessionClient := tree.NewSessionIndexerClient(indexName, indexClient)

	target := sync.NewIndexEndpoint(datasource, indexClientRead, indexClientWrite, sessionClient)

	s.S3client = source
	s.IndexClient = indexClientRead
	s.SyncConfig = syncConfig
	s.ObjectConfig = minioConfig
	s.syncTask = task.NewSync(ctx, source, target)
	s.syncTask.Direction = "left"

	return nil

}

func (s *Handler) watchConfigs() {
	serviceName := common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_SYNC_ + s.dsName
	watcher, e := config.Default().Watch("services", serviceName)
	if e != nil {
		return
	}
	s.watcher = watcher
	for {
		event, err := watcher.Next()
		if err != nil {
			continue
		}
		var cfg object.DataSource
		if event.Scan(&cfg) == nil {
			log.Logger(s.globalCtx).Debug("Config changed on "+serviceName+", comparing", zap.Any("old", s.SyncConfig), zap.Any("new", &cfg))
			if s.SyncConfig.ObjectsBaseFolder != cfg.ObjectsBaseFolder || s.SyncConfig.ObjectsBucket != cfg.ObjectsBucket {
				// @TODO - Object service must be restarted before restarting sync
				log.Logger(s.globalCtx).Info("Path changed on " + serviceName + ", should reload sync task entirely - Please restart service")
			} else if s.SyncConfig.VersioningPolicyName != cfg.VersioningPolicyName || s.SyncConfig.EncryptionMode != cfg.EncryptionMode {
				log.Logger(s.globalCtx).Info("Versioning policy changed on "+serviceName+", updating internal config", zap.Any("cfg", &cfg))
				s.SyncConfig.VersioningPolicyName = cfg.VersioningPolicyName
				s.SyncConfig.EncryptionMode = cfg.EncryptionMode
				s.SyncConfig.EncryptionKey = cfg.EncryptionKey
				<-time.After(2 * time.Second)
				config.TouchSourceNamesForDataServices(common.SERVICE_DATA_SYNC)
			}
		}
	}
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

	diff, e := s.syncTask.Resync(c, req.DryRun, statusChan, doneChan)
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

	s.syncTask.Shutdown()

	serviceName := servicecontext.GetServiceName(ctx)
	dsName := strings.TrimPrefix(serviceName, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_)
	taskClient := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, defaults.NewClient())
	log.Logger(ctx).Info("Removing job for datasource " + dsName)
	_, e := taskClient.DeleteJob(ctx, &jobs.DeleteJobRequest{
		JobID: "resync-ds-" + dsName,
	})
	return e

}
