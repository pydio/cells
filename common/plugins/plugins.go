package plugins

var (
	installInitializers []func()
	initializers        []func()
	afterInits          []func()
)

func RegisterInstall(y ...func()) {
	installInitializers = append(installInitializers, y...)
}
func Register(y ...func()) {
	initializers = append(initializers, y...)
}

func InstallInit() {
	for _, init := range installInitializers {
		init()
	}
}

func Init() {
	for _, init := range initializers {
		init()
	}
}
