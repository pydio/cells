package configregistry

import (
	"context"

	"github.com/spf13/cast"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/kv"
	"github.com/pydio/cells/v5/common/utils/watch"
)

// storeWithEncoder embeds Viper to extend its behavior
type storeWithEncoder struct {
	config.Store

	configx.Unmarshaler
	configx.Marshaller
}

func (s storeWithEncoder) Set(data any) error {
	return s.Val().Set(data)
}

func (s storeWithEncoder) Context(ctx context.Context) configx.Values {
	return storeWithEncoderValues{
		Values:      s.Store.Context(ctx),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s storeWithEncoder) Default(d any) configx.Values {
	return storeWithEncoderValues{
		Values:      s.Store.Default(d),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s storeWithEncoder) Val(path ...string) configx.Values {
	return storeWithEncoderValues{
		Values:      s.Store.Val(path...),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s storeWithEncoder) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	r, err := s.Store.Watch(opts...)
	if err != nil {
		return nil, err
	}
	return storeWithEncoderReceiver{Receiver: r}, nil
}

type storeWithEncoderValues struct {
	configx.Values
	configx.Unmarshaler
	configx.Marshaller
}

func (s storeWithEncoderValues) Clone() configx.Values {
	return storeWithEncoderValues{
		Values:      kv.NewStore().Val(),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s storeWithEncoderValues) Context(ctx context.Context) configx.Values {
	return storeWithEncoderValues{
		Values:      s.Values.Context(ctx),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s storeWithEncoderValues) Default(d any) configx.Values {
	return storeWithEncoderValues{
		Values:      s.Values.Default(d),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s storeWithEncoderValues) Val(path ...string) configx.Values {
	return storeWithEncoderValues{
		Values:      s.Values.Val(path...),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s storeWithEncoderValues) Bytes() []byte {
	data := s.Values.Get()
	if data == nil {
		return []byte{}
	}

	if m := s.Marshaller; m != nil {
		b, err := m.Marshal(data)
		if err != nil {
			return []byte{}
		}

		return b
	}

	return []byte(cast.ToString(data))
}

func (s storeWithEncoderValues) String() string {
	data := s.Values.Get()

	switch v := data.(type) {
	case []interface{}, map[string]interface{}:
		if m := s.Marshaller; m != nil {
			data, err := m.Marshal(v)
			if err != nil {
				return ""
			}

			return string(data)
		}
	}

	return cast.ToString(data)
}

func (s storeWithEncoderValues) Set(data any) error {
	var a any

	if b, ok := data.([]byte); ok {
		if err := s.Unmarshaler.Unmarshal(b, &a); err == nil {
			return s.Values.Set(a)
		}
	}

	return s.Values.Set(data)
}

type storeWithEncoderReceiver struct {
	watch.Receiver
}

func (s storeWithEncoderReceiver) Next() (any, error) {
	n, err := s.Receiver.Next()
	if err != nil {
		return nil, err
	}

	return n, nil
}
