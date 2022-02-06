package memory

import (
	"fmt"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type memory struct {
	v configx.Values
}

func New(opts ...configx.Option) config.Store {
	// opts = append([]configx.Option{configx.WithJSON()}, opts...)

	return &memory{
		v: configx.New(opts...),
	}
}

func (m *memory) Get() configx.Value {
	return m.v
}

func (m *memory) Set(data interface{}) error {
	return m.v.Set(data)
}

func (m *memory) Val(path ...string) configx.Values {
	return m.v.Val(path...)
}

func (m *memory) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *memory) Save(string, string) error {
	// do nothing
	return nil
}

func (m *memory) Watch(path ...string) (configx.Receiver, error) {
	// do nothing
	return &receiver{}, nil
}

type receiver struct{}

func (*receiver) Next() (configx.Values, error) {
	select {}

	return nil, nil
}

func (*receiver) Stop() {
}
