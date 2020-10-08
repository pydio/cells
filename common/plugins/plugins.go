package plugins

import "context"

var (
	installInitializers []func(ctx context.Context)
	initializers        []func(ctx context.Context)
	afterInits          []func()
)

func RegisterInstall(y ...func(ctx context.Context)) {
	installInitializers = append(installInitializers, y...)
}
func Register(y ...func(ctx context.Context)) {
	initializers = append(initializers, y...)
}

func InstallInit(ctx context.Context) {
	for _, init := range installInitializers {
		init(ctx)
	}
}

func Init(ctx context.Context) {
	for _, init := range initializers {
		init(ctx)
	}
}
