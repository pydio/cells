package jobs

import (
	"github.com/pydio/cells/x/configx"
)

func (m *ActionOutput) JsonAsValues() configx.Values {
	v := configx.New(configx.WithJSON())
	v.Set(m.JsonBody)
	return v
}

func (m *ActionOutput) JsonAsValue() configx.Value {
	v := configx.New(configx.WithJSON())
	v.Set(m.JsonBody)
	return v.Get()
}
