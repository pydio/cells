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

package broker

import (
	"context"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"google.golang.org/protobuf/proto"
)

type Message interface {
	Unmarshal(ctx context.Context, target proto.Message) (context.Context, error)
	RawData() (map[string]string, []byte)
}

type message struct {
	header map[string]string
	body   []byte
}

func (m *message) Unmarshal(ctx context.Context, target proto.Message) (context.Context, error) {
	if e := proto.Unmarshal(m.body, target); e != nil {
		return ctx, e
	}

	if m.header != nil {
		ctx = metadata.NewContext(ctx, m.header)
	}

	return ctx, nil
}

func (m *message) RawData() (map[string]string, []byte) {
	return m.header, m.body
}

type MessageQueue interface {
	Consume(callback func(...Message)) error
	PushRaw(ctx context.Context, message Message) error
}
