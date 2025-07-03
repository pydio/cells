package grpc

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"

	"go.uber.org/multierr"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/errors"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	service2 "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/std"
)

type Handler struct {
	service2.UnimplementedMigrateServiceServer
}

func (h *Handler) Migrate(ctx context.Context, request *service2.MigrateRequest) (*service2.MigrateResponse, error) {

	var mcm manager.Manager
	if ok := propagator.Get(ctx, manager.ContextKey, &mcm); !ok {
		return nil, fmt.Errorf("migrate: manager not found")
	}

	svcItems, err := mcm.Registry().List(registry.WithType(pb.ItemType_SERVICE))
	if err != nil {
		return nil, err
	}

	var topoSvcItems []std.TopologicalObject[registry.Item]
	for _, svcItem := range svcItems {
		var order []string
		orderStr, ok := svcItem.Metadata()["order"]
		if ok {
			_ = json.Unmarshal([]byte(orderStr), &order)
		}
		topoSvcItems = append(topoSvcItems, std.TopologicalObject[registry.Item]{
			Object: svcItem,
			After:  order,
		})
	}

	sortedSvcItems1, err := std.TopologicalSort(topoSvcItems)
	if err != nil {
		return nil, err
	}
	for _, svcItem := range sortedSvcItems1 {
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

	return &service2.MigrateResponse{Success: true}, nil
}
