package registry

import (
	"golang.org/x/exp/maps"
)

var _ Registry = (*MetaWrapper)(nil)

type MetaSetter interface {
	SetMetadata(map[string]string)
}

type MetaWrapper struct {
	Registry

	opts Options
	f    func(map[string]string)
}

func NewMetaWrapper(reg Registry, f func(map[string]string), opts ...Option) Registry {
	o := Options{}
	for _, opt := range opts {
		opt(&o)
	}

	return &MetaWrapper{
		Registry: reg,
		opts:     o,
		f:        f,
	}
}

func (m *MetaWrapper) Register(item Item, opts ...RegisterOption) error {

	items := m.opts.filterItems(item)

	if len(items) == 1 {
		orig := item.Metadata()
		meta := maps.Clone(orig)
		if meta == nil {
			meta = make(map[string]string)
		}
		m.f(meta)

		if ms, ok := item.(MetaSetter); ok {
			ms.SetMetadata(meta)
		}
	}

	return m.Registry.Register(item, opts...)
}
