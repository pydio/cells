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

// Package servercontext performs context values read/write, generally through server or client wrappers
package servercontext

import (
	"context"

	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
)

type contextType int

const (
	registryKey contextType = iota
)

func init() {
	runtime.RegisterContextInjector(func(ctx, parent context.Context) context.Context {
		return WithRegistry(ctx, GetRegistry(parent))
	})
}

// WithRegistry links a registry to the context
func WithRegistry(ctx context.Context, reg registry.Registry) context.Context {
	return context.WithValue(ctx, registryKey, reg)
}

// GetRegistry returns the registry from the context in argument
func GetRegistry(ctx context.Context) registry.Registry {
	if conf, ok := ctx.Value(registryKey).(registry.Registry); ok {
		return conf
	}
	return nil
}
