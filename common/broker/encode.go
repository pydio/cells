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

package broker

import (
	"bytes"
	"context"
	"encoding/binary"
	"fmt"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

// EncodeProtoWithContext combines json-encoded context metadata and marshalled proto.Message into a unique []byte
func EncodeProtoWithContext(ctx context.Context, msg proto.Message) []byte {
	var hh []byte
	if md, ok := metadata.FromContextCopy(ctx); ok {
		hh, _ = json.Marshal(md)
	}
	a, _ := anypb.New(msg)
	bb, _ := proto.Marshal(a)
	return joinWithLengthPrefix(hh, bb)
}

// EncodeBrokerMessage just joins on the md+bytes raw data from a broker message
func EncodeBrokerMessage(message Message) []byte {
	md, bb := message.RawData()
	var hh []byte
	if md != nil {
		hh, _ = json.Marshal(md)
	}
	return joinWithLengthPrefix(hh, bb)
}

// DecodeToBrokerMessage tries to parse a combination of json-encoded metadata and a marshalled protobuf
func DecodeToBrokerMessage(msg []byte) (Message, error) {
	if bb, er := splitWithLengthPrefix(msg); er == nil && len(bb) == 2 {
		headers := bb[0]
		rawData := bb[1]
		var mm map[string]string
		if len(headers) > 0 {
			md := map[string]string{}
			if e := json.Unmarshal(headers, &md); e != nil {
				return nil, e
			} else {
				mm = md
			}
		}
		a := &anypb.Any{}
		if e := proto.Unmarshal(rawData, a); e != nil {
			return nil, fmt.Errorf("expecting anypb: %v", er)
		}
		return &pulledMessage{hh: mm, data: rawData, a: a}, nil
	} else {
		return nil, fmt.Errorf("cannot split event %v", er)
	}

}

type pulledMessage struct {
	hh   map[string]string
	data []byte
	a    *anypb.Any
}

func (p *pulledMessage) Unmarshal(ctx context.Context, target proto.Message) (context.Context, error) {
	if e := p.a.UnmarshalTo(target); e != nil {
		return ctx, e
	}
	if p.hh != nil {
		ctx = metadata.NewContext(ctx, p.hh)
		// If X-Pydio-User found in meta, add it to context as well
		if u, ok := p.hh[common.PydioContextUserKey]; ok {
			ctx = context.WithValue(ctx, common.PydioContextUserKey, u)
		}
	}
	return ctx, nil
}

func (p *pulledMessage) RawData() (map[string]string, []byte) {
	return p.hh, p.data
}

func joinWithLengthPrefix(data ...[]byte) []byte {
	var buf bytes.Buffer
	for _, d := range data {
		binary.Write(&buf, binary.LittleEndian, uint32(len(d))) // Write length prefix
		buf.Write(d)                                            // Write the data
	}
	return buf.Bytes()
}

func splitWithLengthPrefix(data []byte) ([][]byte, error) {
	var splits [][]byte
	buf := bytes.NewBuffer(data)
	for buf.Len() > 0 {
		var length uint32
		err := binary.Read(buf, binary.LittleEndian, &length) // Read length prefix
		if err != nil {
			return nil, err
		}
		if int(length) == 0 {
			splits = append(splits, []byte{})
			continue
		}
		if int(length) > buf.Len() {
			return nil, fmt.Errorf("not enough data left for split")
		}
		split := make([]byte, length)
		buf.Read(split) // Read the data
		splits = append(splits, split)
	}
	return splits, nil
}
