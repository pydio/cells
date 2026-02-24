package configx

import "github.com/pydio/cells/v5/common/utils/kv"

type marshaller struct {
	kv.Values
	kv.Marshaller
	kv.Unmarshaler
}

func (m marshaller) Val(path ...string) kv.Values {
	return caster{Storer: marshaller{Values: m.Values.Val(path...), Marshaller: m, Unmarshaler: m}}
}

func (m marshaller) Set(data any) error {
	var b []byte
	if m.Marshaller != nil {
		switch vv := data.(type) {
		case []byte:
			b = vv
		default:
			if v, err := m.Marshaller.Marshal(data); err != nil {
				return err
			} else {
				b = v
			}
		}
	}

	if len(b) == 0 {
		return nil
	}

	if m.Unmarshaler != nil {
		var v any
		if err := m.Unmarshaler.Unmarshal(b, &v); err != nil {
			return err
		} else {
			data = v
		}
	}

	return m.Values.Set(data)
}
