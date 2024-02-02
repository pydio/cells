package registry

type FuncWrapper struct {
	Registry

	opts *FuncWrapperOptions
}

func NewFuncWrapper(reg Registry, opt ...FuncWrapperOption) Registry {
	opts := &FuncWrapperOptions{}

	for _, o := range opt {
		o(opts)
	}

	return &FuncWrapper{
		Registry: reg,
		opts:     opts,
	}
}

func (m *FuncWrapper) Register(item Item, opts ...RegisterOption) error {
	for _, fn := range m.opts.OnRegister {
		fn(&item, &opts)
	}
	return m.Registry.Register(item, opts...)
}

func (m *FuncWrapper) Deregister(item Item, opts ...RegisterOption) error {
	for _, fn := range m.opts.OnDeregister {
		fn(&item, &opts)
	}
	return m.Registry.Deregister(item, opts...)
}

type FuncWrapperOptions struct {
	OnRegister   []func(*Item, *[]RegisterOption)
	OnDeregister []func(*Item, *[]RegisterOption)
}

type FuncWrapperOption func(*FuncWrapperOptions)

func OnRegister(fn func(*Item, *[]RegisterOption)) FuncWrapperOption {
	return func(options *FuncWrapperOptions) {
		options.OnRegister = append(options.OnRegister, fn)
	}
}

func OnDeregister(fn func(*Item, *[]RegisterOption)) FuncWrapperOption {
	return func(options *FuncWrapperOptions) {
		options.OnDeregister = append(options.OnDeregister, fn)
	}
}
