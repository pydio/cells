package registry

type FuncWrapper struct {
	Registry

	fn func(*Item, *[]RegisterOption)
}

func NewFuncWrapper(reg Registry, fn func(*Item, *[]RegisterOption)) Registry {
	return &FuncWrapper{
		Registry: reg,
		fn:       fn,
	}
}

func (m *FuncWrapper) Register(item Item, opts ...RegisterOption) error {
	m.fn(&item, &opts)
	return m.Registry.Register(item, opts...)
}
