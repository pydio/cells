/*
 * Copyright (c) 2023. Abstrium SAS <team (at) pydio.com>
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

package queue

import (
	"context"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/broker"
)

type Consumer func(...broker.Message)

type Queue interface {
	Consume(callback func(...broker.Message)) error
	PushRaw(ctx context.Context, message broker.Message) error
	Push(ctx context.Context, msg proto.Message) error
}

// TypeWithContext composes a generic type and a context
type TypeWithContext[T any] struct {
	Original T
	Ctx      context.Context
}
