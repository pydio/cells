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

package proto

import (
	"errors"

	"github.com/golang/protobuf/proto"
	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/transport/codec"

	brokerproto "github.com/pydio/cells/common/proto/broker"
)

type protoCodec struct{}

func (_ protoCodec) Marshal(v interface{}) ([]byte, error) {
	msg, ok := v.(*broker.Message)
	if !ok {
		return nil, errors.New("invalid message")
	}

	tmp := &brokerproto.Message{}
	if msg != nil {
		tmp.Header = msg.Header
		tmp.Body = msg.Body
	}

	return proto.Marshal(tmp)
}

func (n protoCodec) Unmarshal(d []byte, v interface{}) error {
	msg, ok := v.(*broker.Message)
	if !ok {

		return errors.New("invalid message")
	}

	tmp := &brokerproto.Message{}
	if err := proto.Unmarshal(d, tmp); err != nil {
		return err
	}

	msg.Header = tmp.Header
	msg.Body = tmp.Body

	return nil
}

func (n protoCodec) String() string {
	return "proto"
}

func NewCodec() codec.Codec {
	return protoCodec{}
}
