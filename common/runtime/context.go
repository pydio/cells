/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package runtime

import (
	"context"
	"reflect"
)

type ContextInjector func(ctx, parent context.Context) context.Context

var (
	contextInjectors []ContextInjector
)

// RegisterContextInjector appends a ContextInjector to the internal registry
func RegisterContextInjector(injector ContextInjector) {
	contextInjectors = append(contextInjectors, injector)
}

// ForkContext copies all necessary dependencies using the internal ContextInjector registry
func ForkContext(ctx, parent context.Context) context.Context {
	for _, i := range contextInjectors {
		ctx = i(ctx, parent)
	}
	return ctx
}

// With returns a context which knows its service
func With[T any](ctx context.Context, t *T) context.Context {
	return context.WithValue(ctx, reflect.TypeOf((*T)(nil)), t)
}

func Get[T any](ctx context.Context) *T {
	v, _ := ctx.Value(reflect.TypeOf((*T)(nil))).(*T)
	return v
}
