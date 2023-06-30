package queue

import (
	"bytes"
	"context"
	"encoding/binary"
	"fmt"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

// EncodeProtoWithContext combines json-encoded context metadata and marshalled proto.Message into a unique []byte
func EncodeProtoWithContext(ctx context.Context, msg proto.Message) []byte {
	var hh []byte
	if md, ok := metadata.FromContextCopy(ctx); ok {
		hh, _ = json.Marshal(md)
	}
	bb, _ := proto.Marshal(msg)
	return joinWithLengthPrefix(hh, bb)
}

// DecodeToBrokerMessage tries to parse a combination of json-encoded metadata and a marshalled protobuf
func DecodeToBrokerMessage(msg []byte) (broker.Message, error) {
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
		return &pulledMessage{hh: mm, data: rawData}, nil
	} else {
		return nil, fmt.Errorf("cannot split event %v", er)
	}

}

type pulledMessage struct {
	hh   map[string]string
	data []byte
}

func (p *pulledMessage) Unmarshal(target proto.Message) (context.Context, error) {
	if e := proto.Unmarshal(p.data, target); e != nil {
		return nil, e
	}
	ctx := context.Background()
	if p.hh != nil {
		ctx = metadata.NewContext(ctx, p.hh)
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
