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
	"google.golang.org/protobuf/proto"
)

type Message interface {
	Unmarshal(target proto.Message) error
	RawData() (map[string]string, []byte)
}

type message struct {
	header map[string]string
	body   []byte
}

func (m *message) Unmarshal(target proto.Message) error {
	if e := proto.Unmarshal(m.body, target); e != nil {
		return e
	}
	return nil
}

func (m *message) RawData() (map[string]string, []byte) {
	return m.header, m.body
}
