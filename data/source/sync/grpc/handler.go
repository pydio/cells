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
	"strings"
	sync2 "sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/commons/jobsc"
	grpccli "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/object"
	protosync "github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/sync/endpoints/chanwatcher"
	"github.com/pydio/cells/v4/common/sync/model"
	"github.com/pydio/cells/v4/common/sync/task"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/data/source/sync/clients"
	grpc_jobs "github.com/pydio/cells/v4/scheduler/jobs/grpc"
)

// Handler structure
type Handler struct {
	GlobalCtx      context.Context
	DsName         string
	errorsDetected chan string

	IndexClientRead    tree.NodeProviderClient
	IndexClientWrite   tree.NodeReceiverClient
	IndexClientClean   protosync.SyncEndpointClient
	IndexClientSession tree.SessionIndexerClient
	S3client           model.Endpoint

	SyncTask     *task.Sync
	StMux        *sync2.Mutex
	SyncConfig   *object.DataSource
	ObjectConfig *object.MinioConfig

	watcher configx.Receiver
	stop    chan bool

	ChangeEventsFallback chan *tree.NodeChangeEvent
}

func NewHandler(ctx context.Context, datasource string) *Handler {
	h := &Handler{
		GlobalCtx:      runtime.WithServiceName(ctx, common.ServiceGrpcNamespace_+common.ServiceDataSync_+datasource),
		DsName:         datasource,
		errorsDetected: make(chan string),
		stop:           make(chan bool),
		StMux:          &sync2.Mutex{},
	}
	_ = broker.SubscribeCancellable(ctx, common.TopicIndexEvent, func(c context.Context, message broker.Message) error {
		if !runtime.MultiMatches(c, ctx) {
			return nil
		}
		event := &tree.IndexEvent{}
		if _, e := message.Unmarshal(ctx, event); e == nil {
			if event.SessionForceClose != "" {
				h.BroadcastCloseSession(event.SessionForceClose)
			}
			if event.ErrorDetected && event.DataSourceName == h.DsName {
				h.NotifyError(event.ErrorPath)
			}
		}
		return nil
	}, broker.WithCounterName("sync"))

	return h
}

func (s *Handler) InitAndStart() error {

	serviceName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + s.DsName
	ctx := runtime.WithServiceName(s.GlobalCtx, serviceName)

	if e := s.Init(ctx); e != nil {
		return e
	}

	md := make(map[string]string)
	md[common.PydioContextUserKey] = common.PydioSystemUsername
	jobCtx := propagator.NewContext(ctx, md)
	jobsClient := jobsc.JobServiceClient(ctx)

	if !s.SyncConfig.FlatStorage {
		s.Start()
		if _, err := jobsClient.GetJob(jobCtx, &jobs.GetJobRequest{JobID: "resync-ds-" + s.DsName}); err == nil {
			if !s.SyncConfig.SkipSyncOnRestart {
				log.Logger(jobCtx).Debug("Sending event to start trigger re-indexation")
				broker.MustPublish(jobCtx, common.TopicTimerEvent, &jobs.JobTriggerEvent{
					JobID:  "resync-ds-" + s.DsName,
					RunNow: true,
				})
			}
		} else if errors.Is(err, errors.StatusNotFound) {
			log.Logger(jobCtx).Info("Creating job in scheduler to trigger re-indexation")
			job := grpc_jobs.BuildDataSourceSyncJob(s.DsName, false, !s.SyncConfig.SkipSyncOnRestart)
			_, e := jobsClient.PutJob(jobCtx, &jobs.PutJobRequest{
				Job: job,
			})
			return e
		} else {
			log.Logger(jobCtx).Debug("Could not get info about job, retrying...")
			return err
		}
		return nil
	} else {
		s.StartConfigsOnly()

		var clearConfigKey string

		// Create an authenticated context for sync operations if any
		bg := context.Background()
		bg = propagator.WithUserNameMetadata(bg, common.PydioContextUserKey, common.PydioSystemUsername)
		bg = propagator.ForkOneKey(runtime.ServiceNameKey, bg, ctx)

		if _, has := s.SyncConfig.StorageConfiguration[object.StorageKeyInitFromBucket]; has {
			if _, e := s.FlatScanEmpty(bg, nil, nil); e != nil {
				log.Logger(ctx).Warn("Could not scan storage bucket after start", zap.Error(e))
			} else {
				clearConfigKey = object.StorageKeyInitFromBucket
			}
		} else if snapKey, has := s.SyncConfig.StorageConfiguration[object.StorageKeyInitFromSnapshot]; has {
			if _, e := s.FlatSyncSnapshot(bg, s.SyncConfig, "read", snapKey, nil, nil); e != nil {
				log.Logger(ctx).Warn("Could not init index from stored snapshot after start", zap.Error(e))
			} else {
				clearConfigKey = object.StorageKeyInitFromSnapshot
			}
		}
		if clearConfigKey != "" {
			// Now save config without "initFromBucket" key
			newValue := proto.Clone(s.SyncConfig).(*object.DataSource)
			delete(newValue.StorageConfiguration, clearConfigKey)
			if ce := config.Set(ctx, newValue, "services", serviceName); ce != nil {
				log.Logger(jobCtx).Error("[initFromBucket] Removing "+clearConfigKey+" key from datasource", zap.Error(ce))
			} else {
				if err := config.Save(ctx, "system", "Removing "+clearConfigKey+" key from datasource "+serviceName); err != nil {
					log.Logger(jobCtx).Error("[initFromBucket] Saving "+clearConfigKey+" key removal from datasource", zap.Error(err))
				} else {
					log.Logger(jobCtx).Info("[initFromBucket] Removed "+clearConfigKey+" key from datasource", zap.Object("ds", newValue))
				}
			}

		}

		// Post a job to dump snapshot manually (Flat, non-internal only)
		if !s.SyncConfig.IsInternal() {
			if _, err := jobsClient.GetJob(jobCtx, &jobs.GetJobRequest{JobID: "snapshot-" + s.DsName}); err != nil {
				if errors.Is(err, errors.StatusNotFound) {
					log.Logger(jobCtx).Info("Creating job in scheduler to dump snapshot for " + s.DsName)
					job := grpc_jobs.BuildDataSourceSyncJob(s.DsName, true, false)
					_, e := jobsClient.PutJob(jobCtx, &jobs.PutJobRequest{
						Job: job,
					})
					return e
				} else {
					log.Logger(jobCtx).Info("Could not get info about job, retrying...", zap.Error(err))
					return err
				}
			}
			return nil
		}
	}

	return nil
}

func (s *Handler) Init(ctx context.Context) error {

	var syncConfig *object.DataSource
	if err := config.Get(ctx, "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+s.DsName).Scan(&syncConfig); err != nil {
		return err
	}
	if sec := config.GetSecret(ctx, syncConfig.ApiSecret).String(); sec != "" {
		syncConfig.ApiSecret = sec
	}

	return s.initSync(syncConfig)

}

func (s *Handler) Start() {
	s.StMux.Lock()
	s.SyncTask.Start(s.GlobalCtx, !s.SyncConfig.FlatStorage)
	s.StMux.Unlock()
	go s.watchConfigs()
	go s.watchErrors()
	go s.watchDisconnection()
	go func() {
		<-s.GlobalCtx.Done()
		s.Stop()
	}()
}

func (s *Handler) Stop() {
	s.stop <- true
	s.StMux.Lock()
	s.SyncTask.Shutdown()
	s.StMux.Unlock()
	if s.watcher != nil {
		s.watcher.Stop()
	}
}

func (s *Handler) StartConfigsOnly() {
	go s.watchConfigs()
	go func() {
		<-s.GlobalCtx.Done()
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
	s.StMux.Lock()
	defer s.StMux.Unlock()
	if s.SyncTask == nil {
		return
	}
	s.SyncTask.BroadcastCloseSession(sessionUuid)

}

func (s *Handler) NotifyError(errorPath string) {
	s.errorsDetected <- errorPath
}

func (s *Handler) initSync(syncConfig *object.DataSource) error {

	conn := grpccli.ResolveConn(s.GlobalCtx, common.ServiceDataIndexGRPC_+syncConfig.Name)
	s.IndexClientWrite = tree.NewNodeReceiverClient(conn)
	s.IndexClientRead = tree.NewNodeProviderClient(conn)
	s.IndexClientClean = protosync.NewSyncEndpointClient(conn)
	s.IndexClientSession = tree.NewSessionIndexerClient(conn)

	source, target, minioConfig, err := clients.InitEndpoints(s.GlobalCtx, syncConfig, s.IndexClientRead, s.IndexClientWrite, s.IndexClientSession)
	if err != nil {
		return err
	}

	if !syncConfig.FlatStorage {
		cw := chanwatcher.NewWatcher(s.GlobalCtx, source.(model.PathSyncSource), "")
		s.ChangeEventsFallback = cw.NodeChanges
		source = cw
	}

	s.S3client = source
	s.SyncConfig = syncConfig
	s.ObjectConfig = minioConfig
	s.StMux.Lock()
	s.SyncTask = task.NewSync(source, target, model.DirectionRight)
	s.SyncTask.SkipTargetChecks = true
	s.SyncTask.FailsafeDeletes = true
	s.StMux.Unlock()

	return nil

}

func (s *Handler) watchDisconnection() {
	//defer close(watchOnce)
	watchOnce := make(chan interface{})
	s.StMux.Lock()
	s.SyncTask.SetupEventsChan(nil, nil, watchOnce)
	s.StMux.Unlock()

	for w := range watchOnce {
		if m, ok := w.(*model.EndpointStatus); ok && m.WatchConnection == model.WatchDisconnected {
			log.Logger(s.GlobalCtx).Error("Watcher disconnected! Will try to restart sync now.")
			s.StMux.Lock()
			s.SyncTask.Shutdown()
			s.StMux.Unlock()
			<-time.After(3 * time.Second)
			var syncConfig *object.DataSource
			sName := runtime.GetServiceName(s.GlobalCtx)
			if err := config.Get(s.GlobalCtx, "services", sName).Scan(&syncConfig); err != nil {
				log.Logger(s.GlobalCtx).Error("Cannot read config to reinitialize sync")
			}
			if sec := config.GetSecret(s.GlobalCtx, syncConfig.ApiSecret).String(); sec != "" {
				syncConfig.ApiSecret = sec
			}
			if e := s.initSync(syncConfig); e != nil {
				log.Logger(s.GlobalCtx).Error("Error while restarting sync")
			}
			s.StMux.Lock()
			s.SyncTask.Start(s.GlobalCtx, true)
			s.StMux.Unlock()
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
				ctx := propagator.NewContext(context.Background(), md)
				broker.MustPublish(ctx, common.TopicTimerEvent, &jobs.JobTriggerEvent{
					JobID:  "resync-ds-" + s.DsName,
					RunNow: true,
				})
			}
		case <-s.stop:
			return
		}
	}
}

func (s *Handler) watchConfigs() {
	serviceName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + s.DsName

	// TODO - should be linked to context
	for {
		watcher, e := config.Watch(s.GlobalCtx, configx.WithPath("services", serviceName))
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

			if err := event.(configx.Values).Scan(&cfg); err == nil && cfg.Name == s.DsName {
				log.Logger(s.GlobalCtx).Info("Config changed on "+serviceName+", comparing", zap.Object("old", s.SyncConfig), zap.Object("new", &cfg))
				if s.SyncConfig.ObjectsBaseFolder != cfg.ObjectsBaseFolder || s.SyncConfig.ObjectsBucket != cfg.ObjectsBucket {
					// @TODO - Object service must be restarted before restarting sync
					log.Logger(s.GlobalCtx).Info("Path changed on " + serviceName + ", should reload sync task entirely - Please restart service")
				} else if s.SyncConfig.VersioningPolicyName != cfg.VersioningPolicyName || s.SyncConfig.EncryptionMode != cfg.EncryptionMode {
					log.Logger(s.GlobalCtx).Info("Versioning policy changed on "+serviceName+", updating internal config", zap.Object("cfg", &cfg))
					s.SyncConfig.VersioningPolicyName = cfg.VersioningPolicyName
					s.SyncConfig.EncryptionMode = cfg.EncryptionMode
					s.SyncConfig.EncryptionKey = cfg.EncryptionKey
					<-time.After(2 * time.Second)
					config.TouchSourceNamesForDataServices(s.GlobalCtx, common.ServiceDataSync)
				}
			} else if err != nil {
				log.Logger(s.GlobalCtx).Error("Could not scan event", zap.Error(err))
			}
		}

		watcher.Stop()
		time.Sleep(1 * time.Second)
	}
}
