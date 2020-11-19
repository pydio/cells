package configx

import (
	json "github.com/pydio/cells/x/jsonx"
)

type jsonReader struct{}

func (j *jsonReader) Unmarshal(data []byte, out interface{}) error {
	return json.Unmarshal(data, out)
}

func WithJSON() Option {
	return func(o *Options) {
		o.Unmarshaler = &jsonReader{}
	}
}
