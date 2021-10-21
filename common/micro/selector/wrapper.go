/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

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
				s.deregisterIfOthersAvailable(name, node)
				// Even if deregister did not happen, reset counter
				s.Lock()
				delete(s.registry, id)
				s.Unlock()
			}
		}
	}

	return
}

func (s *selectorWithMaxRetries) deregisterIfOthersAvailable(name string, node *registry.Node) {
	reg := s.Options().Registry

	service, err := reg.GetService(name)
	if err != nil {
		return
	}

	cachedService := cp(service)

	// Do NOT deregister if there is only one node, it will try again and again
	// but we do not want to be left with 0 available nodes.
	if len(cachedService) > 0 && len(cachedService[0].Nodes) > 1 {

		// Deregistering service node
		cachedService[0].Nodes = []*registry.Node{node}
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
