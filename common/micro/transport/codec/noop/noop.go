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

package noop

import (
	"errors"
	"fmt"
	"reflect"

	"github.com/micro/go-micro/transport"
	"github.com/micro/go-micro/transport/codec"
)

type noopCodec struct{}

func (n noopCodec) Marshal(v interface{}) ([]byte, error) {
	msg, ok := v.(*transport.Message)
	if !ok {
		fmt.Println("Invalid message ? ", v, reflect.TypeOf(v))
		return nil, errors.New("invalid message")
	}
	return msg.Body, nil
}

func (n noopCodec) Unmarshal(d []byte, v interface{}) error {
	msg, ok := v.(*transport.Message)
	if !ok {

		return errors.New("invalid message")
	}
	msg.Body = d
	return nil
}

func (n noopCodec) String() string {
	return "noop"
}

func NewCodec() codec.Codec {
	return noopCodec{}
}
