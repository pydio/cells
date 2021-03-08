package micro

import (
	"time"

	"github.com/pydio/cells/x/configx"
	"github.com/pydio/go-os/config"
)

type Micro struct {
	path   string
	config config.Config
}

type mem struct {
	config config.Config
}

type Writer interface {
	Write(cs *config.ChangeSet) error
}

func New(c config.Config) configx.Entrypoint {
	return &mem{
		&writableConfig{c},
	}
}

func (m *mem) Val(path ...string) configx.Values {
	return &values{
		m.config,
		path,
	}
}

func (m *mem) Get() configx.Value {
	v := configx.New(configx.WithJSON())

	m.config.Get().Scan(&v)

	return v
}

func (m *mem) Set(data interface{}) error {
	m.config.Set(data)

	return nil
}

func (m *mem) Del() error {
	m.config.Del()

	return nil
}

func (m *mem) Watch(path ...string) (configx.Receiver, error) {
	w, err := m.config.Watch(path...)
	if err != nil {
		return nil, err
	}

	return &receiver{w}, nil
}

type values struct {
	config config.Config
	path   []string
}

func (v *values) Get() configx.Value {
	return v
}
func (v *values) Set(data interface{}) error {
	v.config.Set(data, configx.StringToKeys(v.path...)...)

	return nil
}
func (v *values) Del() error {
	v.config.Del(v.path...)
	return nil
}
func (v *values) Val(path ...string) configx.Values {
	return &values{
		v.config,
		append(v.path, path...),
	}
}
func (v *values) Default(i interface{}) configx.Value {
	return v
}
func (v *values) Bool() bool {
	return v.config.Get(v.path...).Bool(false)
}
func (v *values) Int() int {
	return v.config.Get(v.path...).Int(0)
}
func (v *values) Int64() int64 {
	return int64(v.Int())
}
func (v *values) Bytes() []byte {
	return []byte(v.String())
}
func (v *values) Duration() time.Duration {
	return v.config.Get(v.path...).Duration(0 * time.Second)
}
func (v *values) String() string {
	return v.config.Get(v.path...).String("")
}
func (v *values) StringMap() map[string]string {
	return v.config.Get(v.path...).StringMap(nil)
}
func (v *values) StringArray() []string {
	var s []string
	v.config.Get(v.path...).Scan(&s)
	return s
}
func (v *values) Slice() []interface{} {
	var s []interface{}
	v.config.Get(v.path...).Scan(&s)
	return s
}
func (v *values) Map() map[string]interface{} {
	var m map[string]interface{}
	v.config.Get(v.path...).Scan(&m)
	return m
}
func (v *values) Scan(i interface{}) error {
	return v.config.Get(v.path...).Scan(i)
}

type receiver struct {
	w config.Watcher
}

func (r *receiver) Next() (configx.Values, error) {
	v, err := r.w.Next()
	if err != nil {
		return nil, err
	}

	var i interface{}
	if err := v.Scan(&i); err != nil {
		return nil, err
	}

	vv := configx.NewFrom(i)

	return vv, nil
}

func (r *receiver) Stop() {
	r.w.Stop()
}
