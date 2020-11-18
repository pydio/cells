package jsonx

import (
	"io"

	jsoniter "github.com/json-iterator/go"
)

var json = jsoniter.ConfigCompatibleWithStandardLibrary

func Marshal(v interface{}) ([]byte, error) {
	return json.Marshal(v)
}

func MarshalIndent(v interface{}, prefix, indent string) ([]byte, error) {
	return json.MarshalIndent(v, prefix, indent)
}

func Unmarshal(data []byte, v interface{}) error {
	return json.Unmarshal(data, v)
}

func NewEncoder(w io.Writer) *jsoniter.Encoder {
	return json.NewEncoder(w)
}

func NewDecoder(r io.Reader) *jsoniter.Decoder {
	return json.NewDecoder(r)
}
