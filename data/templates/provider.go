package templates

import "github.com/micro/go-micro/errors"

var (
	registeredDAOs []DAO
	provider       *TemplateProvider
)

func RegisterProvider(provider DAO) {
	registeredDAOs = append(registeredDAOs, provider)
}

func GetProvider() DAO {
	if provider == nil {
		provider = new(TemplateProvider)
	}
	return provider
}

type TemplateProvider struct {
}

func (t *TemplateProvider) List() []Node {
	var nodes []Node
	for _, dao := range registeredDAOs {
		nodes = append(nodes, dao.List()...)
	}
	return nodes
}

func (t *TemplateProvider) ByUUID(uuid string) (Node, error) {
	var node Node
	for _, dao := range registeredDAOs {
		if n, e := dao.ByUUID(uuid); e == nil {
			node = n
			break
		}
	}
	if node == nil {
		return nil, errors.NotFound("template.not.found", "Cannot find template with this identifier")
	} else {
		return node, nil
	}
}
