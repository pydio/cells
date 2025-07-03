/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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
	"errors"
	"fmt"
	"math"
	"net/url"
	"reflect"
	"strconv"
	"strings"
	"time"

	"go.uber.org/multierr"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/proto/jobs"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/proto/update"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/i18n/languages"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/std"
	"github.com/pydio/cells/v5/common/utils/uuid"
	update2 "github.com/pydio/cells/v5/discovery/update"
	"github.com/pydio/cells/v5/discovery/update/lang"
)

type Handler struct {
	update.UnimplementedUpdateServiceServer
}

func (h *Handler) UpdateRequired(ctx context.Context, request *update.UpdateRequest) (*update.UpdateResponse, error) {

	configs := config.GetUpdatesConfigs(ctx)
	binaries, e := update2.LoadUpdates(ctx, configs, request)
	if e != nil {
		log.Logger(ctx).Error("Failed retrieving available updates", zap.Error(e))
		return nil, e
	}
	response := &update.UpdateResponse{
		Channel:           configs.Val("channel").String(),
		AvailableBinaries: binaries,
	}

	return response, nil
}

func (h *Handler) ApplyUpdate(ctx context.Context, request *update.ApplyUpdateRequest) (*update.ApplyUpdateResponse, error) {

	crtLang := languages.UserLanguageFromContext(ctx, true)
	T := lang.Bundle().T(crtLang)

	configs := config.GetUpdatesConfigs(ctx)
	binaries, e := update2.LoadUpdates(ctx, configs, &update.UpdateRequest{
		PackageName: request.PackageName,
	})
	if e != nil {
		log.Logger(ctx).Error("Failed retrieving available updates", zap.Error(e))
		return nil, e
	}
	var apply *update.Package
	for _, binary := range binaries {
		if binary.Version == request.TargetVersion {
			apply = binary
		}
	}
	if apply == nil {
		return nil, fmt.Errorf("cannot find the requested version")
	}

	log.Logger(ctx).Info("Updating binary now", zap.String("PackageName", apply.PackageName), zap.String("Version", apply.Version), zap.String("URL", apply.BinaryURL))
	uName := claim.UserNameFromContext(ctx)

	// Defining new Context
	newCtx := context.Background()
	pgChan := make(chan float64)
	errorChan := make(chan error)
	doneChan := make(chan bool)

	response := &update.ApplyUpdateResponse{
		Success: true,
		Message: uuid.New(),
	}
	task := &jobs.Task{
		ID:            response.Message,
		JobID:         response.Message,
		Status:        jobs.TaskStatus_Running,
		HasProgress:   true,
		StartTime:     int32(time.Now().Unix()),
		StatusMessage: T("Update.Process.Start"),
		TriggerOwner:  uName,
	}
	job := &jobs.Job{
		ID:    response.Message,
		Label: T("Update.Process.Start"),
		Owner: uName,
		Tasks: []*jobs.Task{task},
	}
	event := &jobs.TaskChangeEvent{
		TaskUpdated: task,
		Job:         job,
	}
	broker.MustPublish(ctx, common.TopicJobTaskEvent, event)
	ct := context.WithoutCancel(ctx)
	go func() {
		defer close(pgChan)
		defer close(errorChan)
		//defer close(doneChan)
		for {
			select {
			case pg := <-pgChan:
				task.Progress = float32(pg)
				if pg < 1 {
					stringProgress := fmt.Sprintf("%v", math.Floor(pg*100))
					task.StatusMessage = strings.Replace(T("Update.Process.Progress"), "{progress}", stringProgress, 1)
				} else {
					task.StatusMessage = T("Update.Process.Verify")
				}
				broker.MustPublish(ct, common.TopicJobTaskEvent, event)
			case e := <-errorChan:
				task.Status = jobs.TaskStatus_Error
				task.StatusMessage = e.Error()
				broker.MustPublish(ct, common.TopicJobTaskEvent, event)
				return
			case <-doneChan:
				task.Status = jobs.TaskStatus_Finished
				task.StatusMessage = T("Update.Process.Finished")
				// Double check if we are on a protected port and log a hint in such case.
				hasProtectedPort := false
				sites, _ := routing.LoadSites(ctx)
				for _, si := range sites {
					for _, a := range si.GetBindURLs() {
						u, _ := url.Parse(a)
						if port, err := strconv.Atoi(u.Port()); err == nil && port < 1024 {
							hasProtectedPort = true
							break
						}
					}
				}
				if hasProtectedPort {
					task.StatusMessage += strings.Join([]string{
						"",
						"----------------",
						T("Update.SetCapDetected.Warning"),
						T("Update.SetCapDetected.Hint"),
						T("Update.SetCapDetected.Command"),
					}, "\n")
				}
				broker.MustPublish(ct, common.TopicJobTaskEvent, event)
				return
			}
		}
	}()

	go update2.ApplyUpdate(newCtx, apply, configs, false, pgChan, doneChan, errorChan)

	return response, nil
}

func (h *Handler) Migrate(ctx context.Context, request *update.MigrateRequest) (*update.MigrateResponse, error) {

	var mcm manager.Manager
	if ok := propagator.Get(ctx, manager.ContextKey, &mcm); !ok {
		return nil, fmt.Errorf("migrate: manager not found")
	}

	svcItems, err := mcm.Registry().List(registry.WithType(pb.ItemType_SERVICE))
	if err != nil {
		return nil, err
	}

	topoSvcItems := []std.TopologicalObject[registry.Item]{}
	for _, svcItem := range svcItems {
		var order []string
		orderStr, ok := svcItem.Metadata()["order"]
		if ok {
			json.Unmarshal([]byte(orderStr), &order)
		}
		topoSvcItems = append(topoSvcItems, std.TopologicalObject[registry.Item]{
			Object: svcItem,
			After:  order,
		})
	}

	sortedSvcItems, err := std.TopologicalSort(topoSvcItems)
	if err != nil {
		return nil, err
	}

	for _, svcItem := range sortedSvcItems {
		var svc service.Service
		if svcItem.As(&svc) {
			storageItems, err := mcm.Registry().List(registry.WithType(pb.ItemType_STORAGE))
			if err != nil {
				return nil, err
			}

			if len(storageItems) > 0 && len(svc.Options().StorageOptions.SupportedDrivers) > 0 {
				var resolutionData map[string][]map[string]string
				if svc.Options().Metadata["resolutionData"] != "" {
					if err := json.Unmarshal([]byte(svc.Options().Metadata["resolutionData"]), &resolutionData); err != nil {
						return nil, err
					}
				}

				for key, supportedDrivers := range svc.Options().StorageOptions.SupportedDrivers {

					for _, supportedDriver := range supportedDrivers {

						handlerV := reflect.ValueOf(supportedDriver.Handler)
						handlerT := reflect.TypeOf(supportedDriver.Handler)
						if handlerV.Kind() != reflect.Func {
							return nil, errors.New("storage handler is not a function")
						}

						startsAt := 0
						// Check if first expected parameter is a context, if so, use the input context
						if handlerT.In(0).Implements(reflect.TypeOf((*context.Context)(nil)).Elem()) {
							startsAt = 1
						}

						for i := startsAt; i < handlerT.NumIn(); i++ {
							for _, storageItem := range storageItems {
								var st storage.Storage
								if !storageItem.As(&st) {
									continue
								}

								out, err := st.Get(ctx)
								if err != nil {
									log.Logger(ctx).Error("failed to get storage", zap.Error(err))
									continue
								}

								if reflect.TypeOf(out) == handlerT.In(i) || (handlerT.In(i).Kind() == reflect.Interface && reflect.TypeOf(out).Implements(handlerT.In(i))) {
									var meta map[string]string
									for _, meta = range resolutionData[key] {
										if meta["type"] == storageItem.Metadata()["driver"] {
											break
										}
									}

									// We need to register the edge between these two
									_, err := mcm.Registry().RegisterEdge(svc.ID(), storageItem.ID(), "storage_"+key, meta)
									if err != nil {
										return nil, err
									}
								}
							}
						}
					}
				}
			}

			s := svc
			if s.Options().MigrateIterator.Lister != nil {
				var errs []error
				for _, key := range s.Options().MigrateIterator.Lister(ctx) {
					ctx := propagator.With(ctx, s.Options().MigrateIterator.ContextKey, key)
					ctx = propagator.With(ctx, service.ContextKey, s)
					errs = append(errs, service.UpdateServiceVersion(ctx, s.Options()))
				}
				if outE := multierr.Combine(errs...); outE != nil {
					log.Logger(ctx).Error("One specific upgrade was not performed successfully, but process is continued", zap.Error(outE))
				}
			} else {
				ctx := propagator.With(ctx, service.ContextKey, s)
				if err := service.UpdateServiceVersion(ctx, s.Options()); err != nil {
					return nil, err
				}
			}
		}
	}

	return &update.MigrateResponse{Success: true}, nil
}
