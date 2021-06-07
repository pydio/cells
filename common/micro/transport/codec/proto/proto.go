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
