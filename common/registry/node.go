package registry

type Node interface {
	Item

	Address() []string
	Endpoints() []string
}

type Endpoint interface {
	Name() string
	Metadata() map[string]string
}

type NodeRegistry interface {
	RegisterNode(Node) error
	DeregisterNode(Node) error
	GetNode(string) (Node, error)
	ListNodes() ([]Node, error)
	As(interface{}) bool
}
