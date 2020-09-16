package configx

import (
	"encoding/json"
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
