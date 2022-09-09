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

package clientcontext

import (
	"context"
	"errors"
	"reflect"

	"github.com/pydio/cells/v4/common/runtime"
)

type contextType int

const (
	clientConnKey contextType = iota
)

func init() {
	runtime.RegisterContextInjector(func(ctx, parent context.Context) context.Context {
		var i interface{}
		GetClientConn(parent, &i)
		return WithClientConn(ctx, i)
	})
}

// WithClientConn links a client connection to the context
func WithClientConn(ctx context.Context, reg interface{}) context.Context {
	return context.WithValue(ctx, clientConnKey, reg)
}

// GetClientConn returns the client connection from the context in argument
func GetClientConn(ctx context.Context, i interface{}) error {
	v := reflect.ValueOf(i)
	if v.Kind() != reflect.Ptr {
		return errors.New("variable is not a pointer")
	}

	cli := ctx.Value(clientConnKey)
	if cli == nil {
		return errors.New("no conn in context")
	}
	cliV := reflect.ValueOf(cli)

	if cliV.CanConvert(v.Elem().Type()) {
		v.Elem().Set(cliV)
	} else {
		return errors.New("type does not match")
	}

	return nil
}
