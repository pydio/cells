package jsonx

import (
	"encoding/json"
	"io"

	jsoniter "github.com/json-iterator/go"
)

type Marshaler json.Marshaler
type Unmarshaler json.Unmarshaler

func Marshal(v interface{}) ([]byte, error) {
	return jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(v)
}

func MarshalIndent(v interface{}, prefix, indent string) ([]byte, error) {
	// MarshalIndent compatible with standard library doesn't indent properly so using directly the old json lib
	return json.MarshalIndent(v, prefix, indent)
}

func Unmarshal(data []byte, v interface{}) error {
	return jsoniter.ConfigCompatibleWithStandardLibrary.Unmarshal(data, v)
}

func NewEncoder(w io.Writer) *jsoniter.Encoder {
	return jsoniter.ConfigCompatibleWithStandardLibrary.NewEncoder(w)
}

func NewDecoder(r io.Reader) *jsoniter.Decoder {
	return jsoniter.ConfigCompatibleWithStandardLibrary.NewDecoder(r)
}

func Valid(data []byte) bool {
	return jsoniter.ConfigCompatibleWithStandardLibrary.Valid(data)
}
