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

package manager

import (
	"context"
	"fmt"
	"io"
	"reflect"
	"unsafe"

	"github.com/valyala/fasttemplate"
	"go.opentelemetry.io/otel/trace"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	registry2 "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/std"
)

func init() {
	propagator.RegisterKeyInjector[Manager](managerKey{})

	openurl.RegisterTemplateInjector(func(_ context.Context, m map[string]any) error {
		m["Meta"] = map[string]any{}
		return nil
	})
}

type InitProvider interface {
	Init(ctx context.Context, store configx.Values) error
}

type ResolveOptions struct {
	Name             string
	CleanBeforeClose bool
}

type ResolveOption func(*ResolveOptions)

func WithName(name string) ResolveOption {
	return func(o *ResolveOptions) {
		o.Name = name
	}
}

func WithCleanBeforeClose() ResolveOption {
	return func(o *ResolveOptions) {
		o.CleanBeforeClose = true
	}
}

func Resolve[T any](ctx context.Context, opts ...ResolveOption) (s T, final error) {
	defer func() {
		if re := recover(); re != nil {
			if err, ok := re.(error); ok {
				final = errors.Tag(err, errors.ResolveError)
			} else if se, o := re.(string); o {
				final = errors.WithMessage(errors.ResolveError, se)
			}
		}
	}()

	o := ResolveOptions{
		Name: "main",
	}

	for _, opt := range opts {
		opt(&o)
	}

	var t T

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "Resolve")
	defer span.End()

	span.AddEvent("Retrieving from context")

	// First we get the contextualized sotwRegistry
	var reg registry.Registry
	if !propagator.Get(ctx, registry.ContextKey, &reg) {
		return t, errors.WithMessage(errors.ResolveError, "cannot find sotwRegistry &reg in context")
	}

	// Then we get the service from the context
	var svc service.Service
	if !propagator.Get(ctx, service.ContextKey, &svc) {
		return t, errors.WithMessage(errors.ResolveError, "cannot find service &svc in context")
	}

	// And we load current config
	var cfg config.Store
	if !propagator.Get(ctx, config.ContextKey, &cfg) {
		//cfg = mg.GetConfig(ctx)
		//} else {
		return t, errors.WithMessage(errors.ResolveError, "cannot find manager to load configs")
	}

	//for {

	span.AddEvent("Before Listing")
	edges, err := reg.List(
		//registry.WithMeta("name", o.Name),
		registry.WithType(registry2.ItemType_EDGE),
		registry.WithFilter(func(item registry.Item) bool {
			if item.Name() != "storage_"+o.Name {
				return false
			}

			edge, ok := item.(registry.Edge)
			if !ok {
				return false
			}

			vv := edge.Vertices()

			if vv[0] == svc.ID() {
				return true
			}

			return false
		}),
	)
	if err != nil {
		return t, errors.Tag(err, errors.ResolveError)
	}
	span.AddEvent("After Listing Edges")

	storages, err := reg.List(
		registry.WithType(registry2.ItemType_STORAGE),
	)
	if err != nil {
		return t, errors.Tag(err, errors.ResolveError)
	}

	span.AddEvent("After Listing Storages")

	// Inject dao in handler
	for _, driver := range svc.Options().StorageOptions.SupportedDrivers[o.Name] {
		handler := driver.Handler
		handlerV := reflect.ValueOf(handler)
		handlerT := reflect.TypeOf(handler)
		if handlerV.Kind() != reflect.Func {
			return t, errors.WithMessage(errors.ResolveError, "storage handler is not a function")
		}

		var assigned int
		var args = make([]reflect.Value, handlerT.NumIn())

		// Check if first expected parameter is a context, if so, use the input context
		if handlerT.In(0).Implements(reflect.TypeOf((*context.Context)(nil)).Elem()) {
			args[0] = reflect.ValueOf(ctx)
			assigned++
		}

		// Try to fit Input parameter type and Storage types
		for _, edge := range registry.ItemsAs[registry.Edge](edges) {

			for _, st := range storages {
				if edge.Vertices()[1] == st.ID() {
					meta := edge.Metadata()
					resolutionData := make(map[string]string, len(meta))
					for k, v := range meta {
						t := fasttemplate.New(v, "{{", "}}")
						resolutionData[k] = t.ExecuteFuncString(func(w io.Writer, tag string) (int, error) {
							var s string
							propagator.Get(ctx, svc.Options().MigrateIterator.ContextKey, &s)

							return w.Write([]byte(s))
						})
					}

					var stt storage.Storage
					if st.As(&stt) {
						sttt, err := stt.Get(ctx, map[string]interface{}{"Meta": resolutionData})
						if err != nil {
							return t, errors.Tag(err, errors.ResolveError)
						}

						connT := reflect.TypeOf(sttt)
						conn := reflect.ValueOf(sttt)

						for pos := 0; pos < handlerT.NumIn(); pos++ {
							if connT.AssignableTo(handlerT.In(pos)) {
								args[pos] = conn
								assigned++
							}
						}
					}
				}
			}
		}

		// TODO - if we don't have all storages yet, we should wait for them to become available
		// The context timeout should decide how long we wait for the storage to become available
		if handlerT.NumIn() != assigned {
			continue
		}

		span.AddEvent("After Service Version")

		dao := handlerV.Call(args)[0].Interface()

		span.AddEvent("After Handler.Call")

		if initProvider, ok := dao.(InitProvider); ok {
			serviceConfigs := cfg.Context(ctx).Val(std.FormatPath("services", svc.Name()))
			if er := initProvider.Init(ctx, serviceConfigs); er != nil {
				return t, errors.Tag(er, errors.ResolveError)
			}
		}

		span.AddEvent("After Init")

		if conv, ok := dao.(T); ok {
			return conv, nil
		}

		return t, errors.WithMessage(errors.ResolveError, "cannot convert to T for "+svc.Name())
	}

	return t, errors.WithMessage(errors.ResolveError, "could not find compatible storage for DAO parameter")
}

func CloseStoragesForContext(ctx context.Context, opts ...ResolveOption) error {
	o := ResolveOptions{
		Name: "main",
	}

	for _, opt := range opts {
		opt(&o)
	}

	// First we get the contextualized sotwRegistry
	var reg registry.Registry
	propagator.Get(ctx, registry.ContextKey, &reg)

	// Then we get the service from the context
	var svc service.Service
	if !propagator.Get(ctx, service.ContextKey, &svc) {
		return errors.New("resolve cannot find service &svc in context")
	}

	//ss := reg.ListAdjacentItems(
	//	sotwRegistry.WithAdjacentSourceItems([]sotwRegistry.Item{svc}),
	//	sotwRegistry.WithAdjacentTargetOptions(sotwRegistry.WithType(registry2.ItemType_STORAGE)),
	//	sotwRegistry.WithAdjacentEdgeOptions(sotwRegistry.WithMeta("name", o.Name)),
	//)
	//
	//for _, s := range sotwRegistry.ItemsAs[storage.Storage[any]](ss) {
	//	if o.CleanBeforeClose {
	//		if er := s.CloseConns(ctx, true); er != nil {
	//			return er
	//		}
	//	} else {
	//		if er := s.CloseConns(ctx); er != nil {
	//			return er
	//		}
	//	}
	//}

	return nil
}

func MustGetConfig(ctx context.Context) config.Store {
	var conf config.Store
	if !propagator.Get(ctx, config.ContextKey, &conf) {
		panic("manager must be set")
	}
	return conf
}

// StorageMigration produces a function for Resolving a storage.Migrator and apply its Migrate function
func StorageMigration(opts ...ResolveOption) func(ctx2 context.Context) error {
	return func(ctx context.Context) error {
		mig, err := Resolve[storage.Migrator](ctx, opts...)
		if err != nil {
			fmt.Println("Got an error resolving as a migrator ", err.Error())
			return nil
		}
		log.Logger(ctx).Info("Running storage migration")
		return mig.Migrate(ctx)
	}
}

func printContextInternals(ctx interface{}, inner bool) {
	contextValues := reflect.ValueOf(ctx).Elem()
	contextKeys := reflect.TypeOf(ctx).Elem()

	if !inner {
		fmt.Printf("\nFields for %s.%s\n", contextKeys.PkgPath(), contextKeys.Name())
	}

	if contextKeys.Kind() == reflect.Struct {
		for i := 0; i < contextValues.NumField(); i++ {
			reflectValue := contextValues.Field(i)
			reflectValue = reflect.NewAt(reflectValue.Type(), unsafe.Pointer(reflectValue.UnsafeAddr())).Elem()

			reflectField := contextKeys.Field(i)

			if reflectField.Name == "Context" {
				printContextInternals(reflectValue.Interface(), true)
			} else {
				fmt.Printf("field name: %+v\n", reflectField.Name)
				fmt.Printf("value: %+v\n", reflectValue.Interface())
			}
		}
	} else {
		fmt.Printf("context is empty (int)\n")
	}
}
