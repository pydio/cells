package configx

import "github.com/pydio/cells/v5/common/utils/kv"

type encrypter struct {
	kv.Values
	kv.Encrypter
	kv.Decrypter
}

func (e encrypter) Val(path ...string) kv.Values {
	return caster{encrypter{Values: e.Values.Val(path...), Encrypter: e, Decrypter: e}}
}

func (e encrypter) Set(data any) error {
	data = encrypt(data, e.Encrypter)

	return e.Values.Set(data)
}

func (e encrypter) Get() any {
	v := e.Values.Get()

	switch vv := v.(type) {
	case []byte:
		b, _ := e.Decrypt(string(vv))
		return string(b)
	case string:
		b, _ := e.Decrypt(vv)
		return string(b)
	}

	return v
}

func encrypt(data any, e kv.Encrypter) any {
	switch v := data.(type) {
	case string:
		str, _ := e.Encrypt([]byte(v))
		return str
	}

	return data
}
