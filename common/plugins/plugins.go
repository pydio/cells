package plugins

var initializers []func()
var afterInits []func()

func Register(y ...func()) {
	initializers = append(initializers, y...)
}

func Init() {
	for _, init := range initializers {
		init()
	}
}
