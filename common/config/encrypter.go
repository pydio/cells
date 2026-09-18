package config

import (
	"context"
	"errors"

	"github.com/pydio/cells/v5/common/utils/kv"
)

// storeWithEncrypter embeds Viper to extend its behavior
type storeWithEncrypter struct {
	Store

	kv.Encrypter
	kv.Decrypter
}

func (s storeWithEncrypter) Set(data any) error {
	return s.Val().Set(data)
}

func (s storeWithEncrypter) Replace(data any) error {
	if value, ok := data.(string); ok {
		encrypted, err := s.Encrypter.Encrypt([]byte(value))
		if err != nil {
			return err
		}
		data = encrypted
	}
	replacer, ok := s.Store.(Replacer)
	if !ok {
		return errors.New("wrapped store does not support atomic replacement")
	}
	return replacer.Replace(data)
}

func (s storeWithEncrypter) Context(ctx context.Context) kv.Values {
	return storeWithEncrypterValues{
		Values:    s.Store.Context(ctx),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s storeWithEncrypter) Default(d any) kv.Values {
	return storeWithEncrypterValues{
		Values:    s.Store.Default(d),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s storeWithEncrypter) Val(path ...string) kv.Values {
	return storeWithEncrypterValues{
		Values:    s.Store.Val(path...),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

type storeWithEncrypterValues struct {
	kv.Values

	kv.Encrypter
	kv.Decrypter
}

func (s storeWithEncrypterValues) Context(ctx context.Context) kv.Values {
	return storeWithEncrypterValues{
		Values:    s.Values.Context(ctx),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s storeWithEncrypterValues) Default(d any) kv.Values {
	return storeWithEncrypterValues{
		Values:    s.Values.Default(d),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s storeWithEncrypterValues) Val(path ...string) kv.Values {
	return storeWithEncrypterValues{
		Values:    s.Values.Val(path...),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s storeWithEncrypterValues) Get() any {
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

func (s storeWithEncrypterValues) String() string {
	v := s.Values.Get()

	str, ok := v.(string)
	if !ok {
		return ""
	}

	b, err := s.Decrypter.Decrypt(str)
	if err != nil {
		return str
	}

	return string(b)
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
