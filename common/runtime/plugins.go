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
	"fmt"
	"strings"
)

var (
	initializers  = make(map[string][]func(ctx context.Context))
	connConsumers = make(map[string][]func(ctx context.Context))
	lastInit      string
)

func Register(typ string, y ...func(ctx context.Context)) {
	for _, t := range strings.Split(typ, ",") {
		initializers[t] = append(initializers[t], y...)
	}
}

func Init(ctx context.Context, typ string) {
	lastInit = typ
	for _, init := range initializers[typ] {
		init(ctx)
	}
}

func LastInitType() string {
	fmt.Println("Last Init Type is", lastInit)
	return lastInit
}

func RegisterGlobalConnConsumer(typ string, y ...func(ctx context.Context)) {
	for _, t := range strings.Split(typ, ",") {
		connConsumers[t] = append(connConsumers[t], y...)
	}
}

func InitGlobalConnConsumers(ctx context.Context, typ string) {
	for _, init := range connConsumers[typ] {
		init(ctx)
	}
}
