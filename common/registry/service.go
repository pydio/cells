package registry

type Service interface {
	Item

	Version() string
	Nodes() []Node
	Tags() []string
	Metadata() map[string]string

	Start() error
	Stop() error

	IsGeneric() bool
	IsGRPC() bool
	IsREST() bool
}
