package selector

import (
	"strings"
	"sync"

	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"google.golang.org/grpc/balancer"
)

type selectorWithMaxRetries struct {
	selector.Selector
	maxRetries int

	*sync.RWMutex
	registry map[string]int
}

func NewSelectorWithMaxRetries(sel selector.Selector, maxRetries int) selector.Selector {
	return &selectorWithMaxRetries{
		Selector:   sel,
		maxRetries: maxRetries,
		RWMutex:    &sync.RWMutex{},
		registry:   make(map[string]int),
	}
}

func (s *selectorWithMaxRetries) Mark(name string, node *registry.Node, err error) {
	if err == nil {
		return
	}

	e := errors.Parse(err.Error())
	if e == nil {
		return
	}

	switch e.Code {
	// retry on timeout or internal server error
	case 408, 500:
		if strings.Contains(e.Detail, balancer.ErrTransientFailure.Error()) {
			id := node.Id

			s.RLock()
			retries := s.registry[id] + 1
			s.RUnlock()

			s.Lock()
			s.registry[id] = retries
			s.Unlock()

			if retries >= s.maxRetries {
				s.deregister(name, node)

				s.Lock()
				delete(s.registry, id)
				s.Unlock()
			}
		}
	}

	return
}

func (s *selectorWithMaxRetries) deregister(name string, node *registry.Node) {
	reg := s.Options().Registry

	service, err := reg.GetService(name)
	if err != nil {
		return
	}

	cachedService := cp(service)

	if len(cachedService) > 0 {
		cachedService[0].Nodes = []*registry.Node{node}

		// Deregistering service node
		err := reg.Deregister(cachedService[0])
		if err != nil {
			return
		}
	}
}

// cp copies a service. Because we're caching handing back pointers would
// create a race condition, so we do this instead
// its fast enough
func cp(current []*registry.Service) []*registry.Service {
	var services []*registry.Service

	for _, service := range current {
		// copy service
		s := new(registry.Service)
		*s = *service

		// copy nodes
		var nodes []*registry.Node
		for _, node := range service.Nodes {
			n := new(registry.Node)
			*n = *node
			nodes = append(nodes, n)
		}
		s.Nodes = nodes

		// copy endpoints
		var eps []*registry.Endpoint
		for _, ep := range service.Endpoints {
			e := new(registry.Endpoint)
			*e = *ep
			eps = append(eps, e)
		}
		s.Endpoints = eps

		// append service
		services = append(services, s)
	}

	return services
}
