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

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/utils/propagator"
)

type contextType int

const (
	clientConnKey contextType = iota
)

func init() {
	propagator.RegisterKeyInjector[grpc.ClientConnInterface](clientConnKey)
}

// WithClientConn links a client connection to the context
func WithClientConn(ctx context.Context, reg grpc.ClientConnInterface) context.Context {
	return context.WithValue(ctx, clientConnKey, reg)
}

// GetClientConn returns the client connection from the context in argument
func GetClientConn(ctx context.Context) grpc.ClientConnInterface {
	if cli, ok := ctx.Value(clientConnKey).(grpc.ClientConnInterface); ok {
		return cli
	}

	return nil
}
