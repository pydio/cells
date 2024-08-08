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

package propagator

import (
	"context"
)

type ContextInjector func(ctx, parent context.Context) context.Context

var (
	contextInjectors []ContextInjector
)

// RegisterContextInjector appends a ContextInjector to the internal registry
func RegisterContextInjector(injector ContextInjector) {
	contextInjectors = append(contextInjectors, injector)
}

// RegisterKeyInjector creates a context injector that copies the type T from parent to child context
func RegisterKeyInjector[T any](key any) {
	contextInjectors = append(contextInjectors, func(ctx, parent context.Context) context.Context {
		var obj T
		if Get(parent, key, &obj) {
			return With(ctx, key, obj)
		}
		return ctx
	})
}

// ForkContext copies all necessary dependencies using the internal ContextInjector registry
func ForkContext(ctx, parent context.Context) context.Context {
	for _, i := range contextInjectors {
		ctx = i(ctx, parent)
	}
	return ctx
}

func ForkOneKey(key any, child, parent context.Context) context.Context {
	if v := parent.Value(key); v != nil {
		return context.WithValue(child, key, v)
	}
	return child
}

// With is a generic context-setter
func With[T any](ctx context.Context, key any, t T) context.Context {
	return context.WithValue(ctx, key, t)
}

// Get is a generic context-getter to an expected type
func Get[T any](ctx context.Context, key any, out *T) bool {
	if ctx == nil {
		return false
	}

	i := ctx.Value(key)
	if i == nil {
		return false
	}

	c, ok := i.(T)
	if !ok {
		return false
	}

	*out = c

	return true
}

// MustWithHint performs a Get() and panics with a hint message if not found
func MustWithHint[T any](ctx context.Context, key any, hint string) T {
	var s T
	if ctx == nil {
		panic("empty context (when looking for " + hint + ")")
	}
	if !Get(ctx, key, &s) {
		er := "No " + hint + " found in context"
		panic(er)
	}
	return s
}
