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
	"math"
	"strconv"
	"strings"
	sync2 "sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	grpccli "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/object"
	protosync "github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/sync/endpoints/chanwatcher"
	"github.com/pydio/cells/v4/common/sync/endpoints/index"
	"github.com/pydio/cells/v4/common/sync/endpoints/s3"
	"github.com/pydio/cells/v4/common/sync/merger"
	"github.com/pydio/cells/v4/common/sync/model"
	"github.com/pydio/cells/v4/common/sync/task"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/std"
	"github.com/pydio/cells/v4/data/source/sync"
	"github.com/pydio/cells/v4/scheduler/tasks"
)

// Handler structure
type Handler struct {
	globalCtx      context.Context
	dsName         string
	handlerName    string
	errorsDetected chan string

	indexClientRead    tree.NodeProviderClient
	indexClientWrite   tree.NodeReceiverClient
	indexClientClean   protosync.SyncEndpointClient
	indexClientSession tree.SessionIndexerClient
	s3client           model.Endpoint

	syncTask     *task.Sync
	SyncConfig   *object.DataSource
	ObjectConfig *object.MinioConfig

	watcher configx.Receiver
	stop    chan bool

	changeEventsFallback chan *tree.NodeChangeEvent

	tree.UnimplementedNodeProviderServer
	tree.UnimplementedNodeReceiverServer
	tree.UnimplementedNodeChangesReceiverStreamerServer
	protosync.UnimplementedSyncEndpointServer
	object.UnimplementedDataSourceEndpointServer
	object.UnimplementedResourceCleanerEndpointServer
}

func NewHandler(ctx context.Context, handlerName, datasource string) (*Handler, error) {
	h := &Handler{
		globalCtx:      ctx,
		dsName:         datasource,
		handlerName:    handlerName,
		errorsDetected: make(chan string),
		stop:           make(chan bool),
	}
	return h, nil
}

func (s *Handler) Init() error {

	var syncConfig *object.DataSource
	if err := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+s.dsName).Scan(&syncConfig); err != nil {
		return err
	}
	if sec := config.GetSecret(syncConfig.ApiSecret).String(); sec != "" {
		syncConfig.ApiSecret = sec
	}

	return s.initSync(syncConfig)

}

func (s *Handler) Name() string {
	return s.handlerName
}

func (s *Handler) Start() {
	s.syncTask.Start(s.globalCtx, !s.SyncConfig.FlatStorage)
	go s.watchConfigs()
	go s.watchErrors()
	go s.watchDisconnection()
	go func() {
		<-s.globalCtx.Done()
		s.Stop()
	}()
}

func (s *Handler) Stop() {
	s.stop <- true
	s.syncTask.Shutdown()
	if s.watcher != nil {
		s.watcher.Stop()
	}
}

func (s *Handler) StartConfigsOnly() {
	go s.watchConfigs()
	go func() {
		<-s.globalCtx.Done()
		s.StopConfigsOnly()
	}()
}

func (s *Handler) StopConfigsOnly() {
	if s.watcher != nil {
		s.watcher.Stop()
	}
}

// BroadcastCloseSession forwards session id to underlying sync task
func (s *Handler) BroadcastCloseSession(sessionUuid string) {
	if s.syncTask == nil {
		return
	}
	s.syncTask.BroadcastCloseSession(sessionUuid)
}

func (s *Handler) NotifyError(errorPath string) {
	s.errorsDetected <- errorPath
}

func (s *Handler) initSync(syncConfig *object.DataSource) error {

	ctx := s.globalCtx
	dataSource := s.dsName

	// Making sure Object AND underlying S3 is started
	var minioConfig *object.MinioConfig
	var indexOK bool
	wg := &sync2.WaitGroup{}
	wg.Add(2)

	// Making sure index is started
	go func() {
		defer wg.Done()
		log.Logger(ctx).Debug("Sync " + dataSource + " - Try to contact Index")
		cli := tree.NewNodeProviderClient(grpccli.GetClientConnFromCtx(ctx, common.ServiceDataIndex_+dataSource))
		if _, e := cli.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: "/"}}); e != nil {
			return
		}
		log.Logger(ctx).Info("Index connected")
		indexOK = true
	}()

	var oc nodes.StorageClient

	// Making sure Objects is started
	var minioErr error
	go func() {
		defer wg.Done()
		cli := object.NewObjectsEndpointClient(grpccli.GetClientConnFromCtx(ctx, common.ServiceDataObjects_+syncConfig.ObjectsServiceName))
		resp, err := cli.GetMinioConfig(ctx, &object.GetMinioConfigRequest{})
		if err != nil {
			log.Logger(ctx).Warn(common.ServiceDataObjects_+syncConfig.ObjectsServiceName+" not yet available", zap.Error(err))
			minioErr = err
			return
		} else if resp.MinioConfig == nil {
			log.Logger(ctx).Debug(common.ServiceDataObjects_ + syncConfig.ObjectsServiceName + " not yet available")
			minioErr = fmt.Errorf("empty config")
			return
		}
		minioConfig = resp.MinioConfig
		if sec := config.GetSecret(minioConfig.ApiSecret).String(); sec != "" {
			minioConfig.ApiSecret = sec
		}
		cfg := minioConfig.ClientConfig()

		var retryCount int
		minioErr = std.Retry(ctx, func() error {
			retryCount++
			var e error
			_ = cfg.Val("userAgentAppName").Set(s3.UserAgentAppName)
			_ = cfg.Val("userAgentVersion").Set(s3.UserAgentVersion)
			oc, e = nodes.NewStorageClient(cfg)
			if e != nil {
				log.Logger(ctx).Error("Cannot create objects client "+e.Error(), zap.Error(e))
				return e
			}
			testCtx := metadata.NewContext(ctx, map[string]string{common.PydioContextUserKey: common.PydioSystemUsername})
			if syncConfig.ObjectsBucket == "" {
				log.Logger(ctx).Debug("Sending ListBuckets", zap.Any("config", syncConfig))
				_, err = oc.ListBuckets(testCtx)
				if err != nil {
					//if retryCount > 1 {
					//	log.Logger(ctx).Warn("Cannot contact s3 service (list buckets), will retry in 4s", zap.Error(err))
					//}
					return err
				} else {
					log.Logger(ctx).Info("Successfully listed buckets")
					return nil
				}
			} else {
				log.Logger(ctx).Debug("Sending ListObjects")
				t := time.Now()
				_, err = oc.ListObjects(testCtx, syncConfig.ObjectsBucket, "", "/", "/", 1)
				log.Logger(ctx).Debug("Sent ListObjects")
				if err != nil {
					if retryCount > 1 {
						log.Logger(ctx).Warn("Cannot contact s3 service (bucket "+syncConfig.ObjectsBucket+"), will retry in 1s", zap.Error(err))
					}
					return err
				} else {
					log.Logger(ctx).Info(fmt.Sprintf("Successfully retrieved first object from bucket %s (%s)", syncConfig.ObjectsBucket, time.Since(t)))
					return nil
				}
			}
		}, 2*time.Second, 180*time.Second)
	}()

	wg.Wait()

	if minioErr != nil {
		return fmt.Errorf("objects not reachable: %v", minioErr)
	} else if minioConfig == nil || oc == nil {
		return fmt.Errorf("objects not reachable")
	} else if !indexOK {
		return fmt.Errorf("index not reachable")
	}

	var source model.PathSyncSource
	if syncConfig.Watch {
		return fmt.Errorf("datasource watch is not implemented yet")
	}
	normalizeS3, _ := strconv.ParseBool(syncConfig.StorageConfiguration[object.StorageKeyNormalize])
	var computer func(string) (int64, error)
	if syncConfig.EncryptionMode != object.EncryptionMode_CLEAR {
		keyClient := encryption.NewNodeKeyManagerClient(grpccli.GetClientConnFromCtx(ctx, common.ServiceEncKey))
		computer = func(nodeUUID string) (i int64, e error) {
			if resp, e := keyClient.GetNodePlainSize(ctx, &encryption.GetNodePlainSizeRequest{
				NodeId: nodeUUID,
				UserId: "ds:" + syncConfig.Name,
			}); e == nil {
				log.Logger(ctx).Debug("Loaded plain size from data-key service")
				return resp.GetSize(), nil
			} else {
				log.Logger(ctx).Error("Cannot loaded plain size from data-key service", zap.Error(e))
				return 0, e
			}
		}
	}
	options := model.EndpointOptions{}
	bucketTags, o1 := syncConfig.StorageConfiguration[object.StorageKeyBucketsTags]
	o1 = o1 && bucketTags != ""
	objectsTags, o2 := syncConfig.StorageConfiguration[object.StorageKeyObjectsTags]
	o2 = o2 && objectsTags != ""
	var syncMetas bool
	if o1 || o2 {
		syncMetas = true
		options.Properties = make(map[string]string)
		if o1 {
			options.Properties[object.StorageKeyBucketsTags] = bucketTags
		}
		if o2 {
			options.Properties[object.StorageKeyObjectsTags] = objectsTags
		}
	}
	if readOnly, o := syncConfig.StorageConfiguration[object.StorageKeyReadonly]; o && readOnly == "true" {
		options.BrowseOnly = true
	}
	var keepNativeEtags bool
	if k, o := syncConfig.StorageConfiguration[object.StorageKeyNativeEtags]; o && k == "true" {
		keepNativeEtags = true
	}
	if syncConfig.ObjectsBucket == "" {
		var bucketsFilter string
		if f, o := syncConfig.StorageConfiguration[object.StorageKeyBucketsRegexp]; o {
			bucketsFilter = f

		}
		multiClient, errs3 := s3.NewMultiBucketClient(ctx, oc, minioConfig.RunningHost, bucketsFilter, options)
		if errs3 != nil {
			return errs3
		}
		if normalizeS3 {
			multiClient.SetServerRequiresNormalization()
		}
		if computer != nil {
			multiClient.SetPlainSizeComputer(computer)
		}
		if dao := servicecontext.GetDAO(s.globalCtx); dao != nil {
			if csm, ok := dao.(s3.ChecksumMapper); ok {
				multiClient.SetChecksumMapper(csm)
			}
		}
		if keepNativeEtags {
			multiClient.SkipRecomputeEtagByCopy()
		}

		source = multiClient

	} else {
		s3client := s3.NewObjectClient(ctx, oc, minioConfig.BuildUrl(), syncConfig.ObjectsBucket, syncConfig.ObjectsBaseFolder, options)
		if normalizeS3 {
			s3client.SetServerRequiresNormalization()
		}
		if computer != nil {
			s3client.SetPlainSizeComputer(computer)
		}
		if /*syncConfig.StorageType == object.StorageType_GCS ||*/ keepNativeEtags {
			s3client.SkipRecomputeEtagByCopy()
		}
		if dao := servicecontext.GetDAO(s.globalCtx); dao != nil {
			if csm, ok := dao.(s3.ChecksumMapper); ok {
				s3client.SetChecksumMapper(csm, true)
			}
		}
		source = s3client
	}

	if !syncConfig.FlatStorage {
		cw := chanwatcher.NewWatcher(ctx, source, "")
		s.changeEventsFallback = cw.NodeChanges
		source = cw
	}

	conn := grpccli.GetClientConnFromCtx(ctx, common.ServiceDataIndex_+dataSource)
	s.indexClientWrite = tree.NewNodeReceiverClient(conn)
	s.indexClientRead = tree.NewNodeProviderClient(conn)
	s.indexClientClean = protosync.NewSyncEndpointClient(conn)
	s.indexClientSession = tree.NewSessionIndexerClient(conn)

	var target model.Endpoint
	if syncMetas {
		target = index.NewClientWithMeta(ctx, dataSource, s.indexClientRead, s.indexClientWrite, s.indexClientSession)
	} else {
		target = index.NewClient(dataSource, s.indexClientRead, s.indexClientWrite, s.indexClientSession)
	}

	s.s3client = source
	s.SyncConfig = syncConfig
	s.ObjectConfig = minioConfig
	s.syncTask = task.NewSync(source, target, model.DirectionRight)
	s.syncTask.SkipTargetChecks = true
	s.syncTask.FailsafeDeletes = true

	return nil

}

func (s *Handler) watchDisconnection() {
	//defer close(watchOnce)
	watchOnce := make(chan interface{})
	s.syncTask.SetupEventsChan(nil, nil, watchOnce)

	for w := range watchOnce {
		if m, ok := w.(*model.EndpointStatus); ok && m.WatchConnection == model.WatchDisconnected {
			log.Logger(s.globalCtx).Error("Watcher disconnected! Will try to restart sync now.")
			s.syncTask.Shutdown()
			<-time.After(3 * time.Second)
			var syncConfig *object.DataSource
			sName := servicecontext.GetServiceName(s.globalCtx)
			if err := config.Get("services", sName).Scan(&syncConfig); err != nil {
				log.Logger(s.globalCtx).Error("Cannot read config to reinitialize sync")
			}
			if sec := config.GetSecret(syncConfig.ApiSecret).String(); sec != "" {
				syncConfig.ApiSecret = sec
			}
			if e := s.initSync(syncConfig); e != nil {
				log.Logger(s.globalCtx).Error("Error while restarting sync")
			}
			s.syncTask.Start(s.globalCtx, true)
			return
		}
	}
}

func (s *Handler) watchErrors() {
	var branch string
	for {
		select {
		case e := <-s.errorsDetected:
			e = "/" + strings.TrimLeft(e, "/")
			if len(branch) == 0 {
				branch = e
			} else {
				path := strings.Split(e, "/")
				stack := strings.Split(branch, "/")
				max := math.Min(float64(len(stack)), float64(len(path)))
				var commonParent []string
				for i := 0; i < int(max); i++ {
					if stack[i] == path[i] {
						commonParent = append(commonParent, stack[i])
					}
				}
				branch = "/" + strings.TrimLeft(strings.Join(commonParent, "/"), "/")
			}
		case <-time.After(5 * time.Second):
			if len(branch) > 0 {
				log.Logger(context.Background()).Info(fmt.Sprintf("Got errors on datasource, should resync now branch: %s", branch))
				branch = ""
				md := make(map[string]string)
				md[common.PydioContextUserKey] = common.PydioSystemUsername
				ctx := metadata.NewContext(context.Background(), md)
				broker.MustPublish(ctx, common.TopicTimerEvent, &jobs.JobTriggerEvent{
					JobID:  "resync-ds-" + s.dsName,
					RunNow: true,
				})
			}
		case <-s.stop:
			return
		}
	}
}

func (s *Handler) watchConfigs() {
	serviceName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + s.dsName

	// TODO - should be linked to context
	for {
		watcher, e := config.Watch(configx.WithPath("services", serviceName))
		if e != nil {
			time.Sleep(1 * time.Second)
			continue
		}

		s.watcher = watcher
		for {
			event, err := watcher.Next()
			if err != nil {
				break
			}

			var cfg object.DataSource

			if err := event.(configx.Values).Scan(&cfg); err == nil && cfg.Name == s.dsName {
				log.Logger(s.globalCtx).Info("Config changed on "+serviceName+", comparing", zap.Any("old", s.SyncConfig), zap.Any("new", &cfg))
				if s.SyncConfig.ObjectsBaseFolder != cfg.ObjectsBaseFolder || s.SyncConfig.ObjectsBucket != cfg.ObjectsBucket {
					// @TODO - Object service must be restarted before restarting sync
					log.Logger(s.globalCtx).Info("Path changed on " + serviceName + ", should reload sync task entirely - Please restart service")
				} else if s.SyncConfig.VersioningPolicyName != cfg.VersioningPolicyName || s.SyncConfig.EncryptionMode != cfg.EncryptionMode {
					log.Logger(s.globalCtx).Info("Versioning policy changed on "+serviceName+", updating internal config", zap.Any("cfg", &cfg))
					s.SyncConfig.VersioningPolicyName = cfg.VersioningPolicyName
					s.SyncConfig.EncryptionMode = cfg.EncryptionMode
					s.SyncConfig.EncryptionKey = cfg.EncryptionKey
					<-time.After(2 * time.Second)
					config.TouchSourceNamesForDataServices(common.ServiceDataSync)
				}
			} else if err != nil {
				log.Logger(s.globalCtx).Error("Could not scan event", zap.Error(err))
			}
		}

		watcher.Stop()
		time.Sleep(1 * time.Second)
	}
}

// TriggerResync sets 2 servers in sync
func (s *Handler) TriggerResync(c context.Context, req *protosync.ResyncRequest) (*protosync.ResyncResponse, error) {

	resp := &protosync.ResyncResponse{}
	var statusChan chan model.Status
	var doneChan chan interface{}
	fullLog := &jobs.ActionLog{
		OutputMessage: &jobs.ActionMessage{},
	}

	if req.Task != nil {
		statusChan = make(chan model.Status)
		doneChan = make(chan interface{})

		subCtx := metadata.WithUserNameMetadata(context.Background(), common.PydioSystemUsername)
		subCtx = runtime.ForkContext(subCtx, c)

		theTask := req.Task
		autoClient := tasks.NewTaskReconnectingClient(subCtx)
		taskChan := make(chan interface{}, 1000)
		autoClient.StartListening(taskChan)

		theTask.StatusMessage = "Starting"
		theTask.HasProgress = true
		theTask.Progress = 0
		theTask.Status = jobs.TaskStatus_Running
		theTask.StartTime = int32(time.Now().Unix())
		theTask.ActionsLogs = append(theTask.ActionsLogs, fullLog)

		log.TasksLogger(c).Info("Starting Resync")
		taskChan <- theTask

		go func() {
			defer func() {
				close(doneChan)
				<-time.After(2 * time.Second)
				close(statusChan)
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
					ta.StatusMessage = "Complete"
					ta.EndTime = int32(time.Now().Unix())
					ta.Status = jobs.TaskStatus_Finished
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
	}

	// First trigger a Resync on index, to clean potential issues
	if _, e := s.indexClientClean.TriggerResync(c, req); e != nil {
		if req.Task != nil {
			log.TasksLogger(c).Error("Could not run index Lost+found "+e.Error(), zap.Error(e))
		} else {
			log.Logger(c).Error("Could not run index Lost+found "+e.Error(), zap.Error(e))
		}
	}

	// Copy context
	//bg := context.Background()
	bg := metadata.WithUserNameMetadata(c, common.PydioSystemUsername)
	bg = servicecontext.WithServiceName(bg, servicecontext.GetServiceName(c))
	if s, o := servicecontext.SpanFromContext(c); o {
		bg = servicecontext.WithSpan(bg, s)
	}

	var result model.Stater
	var e error
	if s.SyncConfig.FlatStorage {
		pathParts := strings.Split(strings.Trim(req.GetPath(), "/"), "/")
		if len(pathParts) == 2 {
			dir := pathParts[0]
			snapName := pathParts[1]
			result, e = s.FlatSyncSnapshot(bg, dir, snapName, statusChan, doneChan)
		} else if len(pathParts) == 1 && pathParts[0] == "init" {
			result, e = s.FlatScanEmpty(bg, statusChan, doneChan)
		} else {
			// Nothing to do, just close doneChan
			if doneChan != nil {
				doneChan <- true
			}

			resp.Success = true
			return resp, nil
		}
	} else {
		s.syncTask.SetupEventsChan(statusChan, doneChan, nil)
		result, e = s.syncTask.Run(bg, req.DryRun, false)
	}

	if e != nil {
		if req.Task != nil {
			theTask := req.Task
			taskClient := jobs.NewJobServiceClient(grpccli.GetClientConnFromCtx(s.globalCtx, common.ServiceJobs))
			theTask.StatusMessage = "Error"
			theTask.HasProgress = true
			theTask.Progress = 1
			theTask.EndTime = int32(time.Now().Unix())
			theTask.Status = jobs.TaskStatus_Error
			log.TasksLogger(c).Error("Error during sync task", zap.Error(e))
			theTask.ActionsLogs = append(theTask.ActionsLogs, fullLog)
			taskClient.PutTask(c, &jobs.PutTaskRequest{Task: theTask})
		}
		return nil, e
	} else if result != nil {
		data, _ := json.Marshal(result.Stats())
		resp.JsonDiff = string(data)
		resp.Success = true
		return resp, nil
	} else {
		return nil, fmt.Errorf("empty result")
	}
}

// GetDataSourceConfig implements the S3Endpoint Interface by using the real object configs + the local datasource configs for bucket and base folder.
func (s *Handler) GetDataSourceConfig(ctx context.Context, request *object.GetDataSourceConfigRequest) (*object.GetDataSourceConfigResponse, error) {

	if s.SyncConfig == nil {
		return nil, fmt.Errorf("syncConfig not initialized yet")
	}
	s.SyncConfig.ObjectsHost = s.ObjectConfig.RunningHost
	s.SyncConfig.ObjectsPort = s.ObjectConfig.RunningPort
	s.SyncConfig.ObjectsSecure = s.ObjectConfig.RunningSecure
	s.SyncConfig.ApiKey = s.ObjectConfig.ApiKey
	s.SyncConfig.ApiSecret = s.ObjectConfig.ApiSecret

	return &object.GetDataSourceConfigResponse{
		DataSource: s.SyncConfig,
	}, nil
}

// CleanResourcesBeforeDelete gracefully stops the sync task and remove the associated resync job
func (s *Handler) CleanResourcesBeforeDelete(ctx context.Context, request *object.CleanResourcesRequest) (*object.CleanResourcesResponse, error) {

	response := &object.CleanResourcesResponse{}
	s.syncTask.Shutdown()

	var mm []string
	var ee []string

	if dao := servicecontext.GetDAO(ctx); dao != nil {
		if d, o := dao.(sync.DAO); o {
			if m, e := d.CleanResourcesOnDeletion(); e != nil {
				ee = append(ee, e.Error())
			} else {
				mm = append(mm, m)
			}

		}
	}

	serviceName := servicecontext.GetServiceName(ctx)
	dsName := strings.TrimPrefix(serviceName, common.ServiceGrpcNamespace_+common.ServiceDataSync_)
	taskClient := jobs.NewJobServiceClient(grpccli.GetClientConnFromCtx(ctx, common.ServiceJobs))
	log.Logger(ctx).Info("Removing job for datasource " + dsName)
	if _, e := taskClient.DeleteJob(ctx, &jobs.DeleteJobRequest{
		JobID: "resync-ds-" + dsName,
	}); e != nil {
		ee = append(ee, e.Error())
	} else {
		mm = append(mm, "Removed associated job for datasource")
	}
	if len(ee) > 0 {
		response.Success = false
		return nil, fmt.Errorf(strings.Join(ee, ", "))
	} else if len(mm) > 0 {
		response.Success = true
		response.Message = strings.Join(mm, ", ")
		return response, nil
	}

	return response, nil
}
