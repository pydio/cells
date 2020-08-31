package configx

import (
	"bytes"
	"encoding/json"
	"time"

	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/proto"
	"github.com/spf13/cast"
)

type def struct {
	v interface{}
}

func (d *def) Default(i interface{}) Value {
	if d.v == nil {
		d.v = i
	}

	return d
}

func (d *def) Bool() bool {
	return cast.ToBool(d.v)
}

func (d *def) Bytes() []byte {
	return []byte(cast.ToString(d.v))
}
func (d *def) Int() int {
	return cast.ToInt(d.v)
}
func (d *def) Int64() int64 {
	return cast.ToInt64(d.v)
}
func (d *def) Duration() time.Duration {
	return cast.ToDuration(d.v)
}
func (d *def) String() string {
	return cast.ToString(d.v)
}
func (d *def) StringMap() map[string]string {
	return cast.ToStringMapString(d.v)
}
func (d *def) StringArray() []string {
	return cast.ToStringSlice(d.v)
}
func (d *def) Slice() []interface{} {
	return cast.ToSlice(d.v)
}
func (d *def) Map() map[string]interface{} {
	r, _ := cast.ToStringMapE(d.v)
	return r
}
func (d *def) Scan(val interface{}) error {
	jsonStr, err := json.Marshal(d.v)
	if err != nil {
		return err
	}

	switch v := val.(type) {
	case proto.Message:
		err = (&jsonpb.Unmarshaler{AllowUnknownFields: true}).Unmarshal(bytes.NewReader(jsonStr), v)
	default:
		err = json.Unmarshal(jsonStr, v)
	}

	return err
}
