package configx

import (
	"fmt"
	"time"

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

// func (d *def) Bytes() []byte {
// 	return cast.ToBytes(d.v)
// }
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
	fmt.Println(d.v)
	r, e := cast.ToStringMapE(d.v)
	fmt.Println(e)
	return r
}
