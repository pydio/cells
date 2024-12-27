package viper

import (
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/configx"
)

// storeWithEncoder embeds Viper to extend its behavior
type storeWithEncoder struct {
	config.Store

	configx.Unmarshaler
}

func (s *storeWithEncoder) Set(data any) error {
	return s.Val().Set(data)
}

func (s *storeWithEncoder) Val(path ...string) configx.Values {
	return &storeWithEncoderValues{Values: s.Store.Val(path...), Unmarshaler: s.Unmarshaler}
}

type storeWithEncoderValues struct {
	configx.Values
	configx.Unmarshaler
}

func (s *storeWithEncoderValues) Val(path ...string) configx.Values {
	return &storeWithEncoderValues{
		Values:      s.Values.Val(path...),
		Unmarshaler: s.Unmarshaler,
	}
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
