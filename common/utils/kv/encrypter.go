package kv

import (
	"context"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/configx"
)

// storeWithEncrypter embeds Viper to extend its behavior
type storeWithEncrypter struct {
	config.Store

	configx.Encrypter
	configx.Decrypter
}

func (s storeWithEncrypter) Set(data any) error {
	return s.Val().Set(data)
}

func (s storeWithEncrypter) Context(ctx context.Context) configx.Values {
	return storeWithEncrypterValues{
		Values:    s.Store.Context(ctx),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s storeWithEncrypter) Default(d any) configx.Values {
	return storeWithEncrypterValues{
		Values:    s.Store.Default(d),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s storeWithEncrypter) Val(path ...string) configx.Values {
	return storeWithEncrypterValues{
		Values:    s.Store.Val(path...),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

type storeWithEncrypterValues struct {
	configx.Values

	configx.Encrypter
	configx.Decrypter
}

func (s storeWithEncrypterValues) Context(ctx context.Context) configx.Values {
	return storeWithEncrypterValues{
		Values:    s.Values.Context(ctx),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s storeWithEncrypterValues) Default(d any) configx.Values {
	return storeWithEncrypterValues{
		Values:    s.Values.Default(d),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s storeWithEncrypterValues) Val(path ...string) configx.Values {
	return storeWithEncrypterValues{
		Values:    s.Values.Val(path...),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s storeWithEncrypterValues) Get(...configx.WalkOption) any {
	v := s.Values.Get()

	str, ok := v.(string)
	if !ok {
		return s.Values.Get()
	}

	b, err := s.Decrypter.Decrypt(str)
	if err != nil {
		return nil
	}

	return b
}

func (s storeWithEncrypterValues) Set(data any) error {
	switch v := data.(type) {
	case string:
		str, err := s.Encrypter.Encrypt([]byte(v))
		if err != nil {
			return err
		}

		return s.Values.Set(str)
	}

	return s.Values.Set(data)
}
