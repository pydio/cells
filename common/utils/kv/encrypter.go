package kv

import (
	"github.com/go-jose/go-jose/v3/json"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/configx"
)

// storeWithEncrypter embeds Viper to extend its behavior
type storeWithEncrypter struct {
	config.Store

	configx.Encrypter
	configx.Decrypter
}

func (s *storeWithEncrypter) Set(data any) error {
	return s.Val().Set(data)
}

func (s *storeWithEncrypter) Val(path ...string) configx.Values {
	return &storeWithEncrypterValues{
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

func (s *storeWithEncrypterValues) Val(path ...string) configx.Values {
	return &storeWithEncrypterValues{
		Values:    s.Values.Val(path...),
		Encrypter: s.Encrypter,
		Decrypter: s.Decrypter,
	}
}

func (s *storeWithEncrypterValues) Get(...configx.WalkOption) any {
	v := s.Values.Get()

	str, ok := v.(string)
	if !ok {
		return s.Values.Get()
	}

	b, err := s.Decrypter.Decrypt(str)
	if err != nil {
		return nil
	}

	var a any
	if err := json.Unmarshal(b, &a); err != nil {
		return nil
	}

	return a
}

func (s *storeWithEncrypterValues) Set(data any) error {
	b, err := json.Marshal(data)
	if err != nil {
		return err
	}

	str, err := s.Encrypter.Encrypt(b)
	if err != nil {
		return err
	}

	return s.Values.Set(str)
}
