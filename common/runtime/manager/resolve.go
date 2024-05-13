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

	"github.com/pkg/errors"

	"github.com/pydio/cells/v4/common/config"
	registry2 "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	runtimecontext.RegisterContextInjector(func(ctx, parent context.Context) context.Context {
		var mg Manager
		if runtimecontext.Get(parent, managerKey{}, &mg) {
			return runtimecontext.With(ctx, managerKey{}, mg)
		}
		return ctx
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

func Resolve[T any](ctx context.Context, opts ...ResolveOption) (T, error) {
	o := ResolveOptions{
		Name: "main",
	}

	for _, opt := range opts {
		opt(&o)
	}

	var t T

	// First we get the contextualized registry
	var reg registry.Registry
	runtimecontext.Get(ctx, registry.ContextKey, &reg)

	// Then we get the service from the context
	var svc service.Service
	if !runtimecontext.Get(ctx, service.ContextKey, &svc) {
		return t, fmt.Errorf("resolve cannot find service &svc in context")
	}

	// And we load current config
	var mg Manager
	var cfg config.Store
	if runtimecontext.Get(ctx, managerKey{}, &mg) {
		cfg = mg.GetConfig(ctx)
	} else {
		return t, fmt.Errorf("resolve cannot find manager to load configs")
	}

	ss := reg.ListAdjacentItems(
		registry.WithAdjacentSourceItems([]registry.Item{svc}),
		registry.WithAdjacentTargetOptions(registry.WithType(registry2.ItemType_STORAGE)),
		registry.WithAdjacentEdgeOptions(registry.WithMeta("name", o.Name)),
	)
	storages := registry.ItemsAs[storage.Storage](ss)

	// Inject dao in handler
	for _, handler := range svc.Options().StorageOptions.SupportedDrivers[o.Name] {
		handlerV := reflect.ValueOf(handler)
		handlerT := reflect.TypeOf(handler)
		if handlerV.Kind() != reflect.Func {
			return t, errors.New("storage handler is not a function")
		}

		var args []reflect.Value

		// Check if first expected parameter is a context, if so, use the input context
		if handlerT.In(0).Implements(reflect.TypeOf((*context.Context)(nil)).Elem()) {
			args = append(args, reflect.ValueOf(ctx))
		}

		// Retrieved storages must fit the next expected parameters in the same order
		for _, st := range storages {

			argPos := len(args)
			conn := reflect.New(handlerT.In(argPos))
			if isCompat, err := st.Get(ctx, conn.Interface()); !isCompat {
				return t, fmt.Errorf("database interface is not compatible for parameter %d", argPos)
			} else if err != nil {
				return t, err
			}

			args = append(args, conn.Elem())
		}

		// Checking all migrations
		if err := service.UpdateServiceVersion(ctx, cfg, svc.Options()); err != nil {
			return t, err
		}

		if handlerT.NumIn() != len(args) {
			return t, fmt.Errorf("number of connections (%d) differs from what is requested by handler (%d)", handlerT.NumIn(), len(args))
		}
		dao := handlerV.Call(args)[0].Interface()

		if initProvider, ok := dao.(InitProvider); ok {
			serviceConfigs := cfg.Val(configx.FormatPath("services", svc.Name()))
			if er := initProvider.Init(ctx, serviceConfigs); er != nil {
				return t, er
			}
		}

		return dao.(T), nil
	}

	return t, nil
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
	runtimecontext.Get(ctx, registry.ContextKey, &reg)

	// Then we get the service from the context
	var svc service.Service
	if !runtimecontext.Get(ctx, service.ContextKey, &svc) {
		return fmt.Errorf("resolve cannot find service &svc in context")
	}

	ss := reg.ListAdjacentItems(
		registry.WithAdjacentSourceItems([]registry.Item{svc}),
		registry.WithAdjacentTargetOptions(registry.WithType(registry2.ItemType_STORAGE)),
		registry.WithAdjacentEdgeOptions(registry.WithMeta("name", o.Name)),
	)

	for _, s := range registry.ItemsAs[storage.Storage](ss) {
		if o.CleanBeforeClose {
			if er := s.CloseConns(ctx, true); er != nil {
				return er
			}
		} else {
			if er := s.CloseConns(ctx); er != nil {
				return er
			}
		}
	}

	return nil
}

func MustGetConfig(ctx context.Context) config.Store {
	var mg Manager
	if !runtimecontext.Get(ctx, contextKey, &mg) {
		panic("manager must be set")
	}
	return mg.GetConfig(ctx)
}
