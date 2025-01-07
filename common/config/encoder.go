package config

import (
	"context"

	"github.com/spf13/cast"

	"github.com/pydio/cells/v5/common/utils/configx"
)

// storeWithEncoder embeds Viper to extend its behavior
type storeWithEncoder struct {
	Store

	configx.Unmarshaler
	configx.Marshaller
}

func (s *storeWithEncoder) Set(data any) error {
	return s.Val().Set(data)
}

func (s *storeWithEncoder) Context(ctx context.Context) configx.Values {
	return &storeWithEncoderValues{
		Values:      s.Store.Context(ctx),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s *storeWithEncoder) Default(d any) configx.Values {
	return &storeWithEncoderValues{
		Values:      s.Store.Default(d),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s *storeWithEncoder) Val(path ...string) configx.Values {
	return &storeWithEncoderValues{
		Values:      s.Store.Val(path...),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

type storeWithEncoderValues struct {
	configx.Values
	configx.Unmarshaler
	configx.Marshaller
}

func (s *storeWithEncoderValues) Context(ctx context.Context) configx.Values {
	return &storeWithEncoderValues{
		Values:      s.Values.Context(ctx),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s *storeWithEncoderValues) Default(d any) configx.Values {
	return &storeWithEncoderValues{
		Values:      s.Values.Default(d),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s *storeWithEncoderValues) Val(path ...string) configx.Values {
	return &storeWithEncoderValues{
		Values:      s.Values.Val(path...),
		Unmarshaler: s.Unmarshaler,
		Marshaller:  s.Marshaller,
	}
}

func (s *storeWithEncoderValues) Bytes() []byte {
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

func (s *storeWithEncoderValues) String() string {
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

func (s *storeWithEncoderValues) Set(data any) error {
	switch v := data.(type) {
	case []byte:
		var a any
		if err := s.Unmarshaler.Unmarshal(v, &a); err != nil {
			return err
		}

		return s.Values.Set(a)
	}

	return s.Values.Set(data)
}
