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
	"reflect"
	"runtime"

	"go.opentelemetry.io/otel/trace"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	registry2 "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/telemetry/tracing"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

func init() {
	propagator.RegisterKeyInjector[Manager](managerKey{})
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

	// First we get the contextualized registry
	var reg registry.Registry
	if !propagator.Get(ctx, registry.ContextKey, &reg) {
		return t, errors.WithMessage(errors.ResolveError, "cannot find registry &reg in context")
	}

	// Then we get the service from the context
	var svc service.Service
	if !propagator.Get(ctx, service.ContextKey, &svc) {
		return t, errors.WithMessage(errors.ResolveError, "cannot find service &svc in context")
	}

	// And we load current config
	var mg Manager
	var cfg config.Store
	if propagator.Get(ctx, managerKey{}, &mg) {
		cfg = mg.GetConfig(ctx)
	} else {
		return t, errors.WithMessage(errors.ResolveError, "cannot find manager to load configs")
	}

	span.AddEvent("Before Listing")
	edges, err := reg.List(
		registry.WithName("storage"),
		registry.WithMeta("name", o.Name),
		registry.WithType(registry2.ItemType_EDGE),
		registry.WithFilter(func(item registry.Item) bool {
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
	for _, handler := range svc.Options().StorageOptions.SupportedDrivers[o.Name] {
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
					for k, v := range edge.Metadata() {
						ctx = context.WithValue(ctx, k, v)
					}

					var stt storage.Storage
					if st.As(&stt) {
						sttt, err := stt.Get(ctx)
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

		span.AddEvent("Before Service Version")

		// Checking all migrations
		if err := service.UpdateServiceVersion(ctx, cfg, svc.Options()); err != nil {
			return t, errors.Tag(err, errors.ResolveError)
		}

		if handlerT.NumIn() != assigned {
			return t, errors.WithMessagef(errors.ResolveError, "number of connections (%d) differs from what is requested by handler %s (%d)", assigned, runtime.FuncForPC(handlerV.Pointer()).Name(), handlerT.NumIn())
		}

		span.AddEvent("After Service Version")

		dao := handlerV.Call(args)[0].Interface()

		span.AddEvent("After Handler.Call")

		if initProvider, ok := dao.(InitProvider); ok {
			serviceConfigs := cfg.Val(configx.FormatPath("services", svc.Name()))
			if er := initProvider.Init(ctx, serviceConfigs); er != nil {
				return t, errors.Tag(er, errors.ResolveError)
			}
		}

		return dao.(T), nil
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

	// First we get the contextualized registry
	var reg registry.Registry
	propagator.Get(ctx, registry.ContextKey, &reg)

	// Then we get the service from the context
	var svc service.Service
	if !propagator.Get(ctx, service.ContextKey, &svc) {
		return fmt.Errorf("resolve cannot find service &svc in context")
	}

	//ss := reg.ListAdjacentItems(
	//	registry.WithAdjacentSourceItems([]registry.Item{svc}),
	//	registry.WithAdjacentTargetOptions(registry.WithType(registry2.ItemType_STORAGE)),
	//	registry.WithAdjacentEdgeOptions(registry.WithMeta("name", o.Name)),
	//)
	//
	//for _, s := range registry.ItemsAs[storage.Storage[any]](ss) {
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
	var mg Manager
	if !propagator.Get(ctx, ContextKey, &mg) {
		panic("manager must be set")
	}
	return mg.GetConfig(ctx)
}

// StorageMigration produces a function for Resolving a storage.Migrator and apply its Migrate function
func StorageMigration(opts ...ResolveOption) func(ctx2 context.Context) error {
	return func(ctx context.Context) error {
		mig, err := Resolve[storage.Migrator](ctx, opts...)
		if err != nil {
			return nil
		}
		return mig.Migrate(ctx)
	}
}
