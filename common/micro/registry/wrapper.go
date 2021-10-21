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

package registry

import (
	"errors"
	"fmt"
	"time"

	"github.com/micro/go-micro/registry"

	"github.com/pydio/cells/common/config"
	pydioregistry "github.com/pydio/cells/common/registry"
)

type registryWithExpiry struct {
	registry.Registry
	duration time.Duration
}

func NewRegistryWithExpiry(r registry.Registry, duration time.Duration) registry.Registry {
	return &registryWithExpiry{Registry: r, duration: duration}
}

func (r *registryWithExpiry) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	// Adding time as a string metadata for the nodes
	for _, node := range s.Nodes {
		// Adding twice the ttl to make sure we don't have any false positive
		data, _ := time.Now().Add(r.duration).MarshalText()
		node.Metadata["expiry"] = string(data)
	}

	return r.Registry.Register(s, opts...)
}

func (r *registryWithExpiry) ListServices() ([]*registry.Service, error) {
	services, err := r.Registry.ListServices()
	if err != nil {
		return nil, err
	}

	for _, service := range services {
		var nodes []*registry.Node

		for _, node := range service.Nodes {
			exp, ok := node.Metadata["expiry"]
			if !ok {
				continue
			}

			var expiry time.Time
			if err := expiry.UnmarshalText([]byte(exp)); err != nil {
				continue
			}

			if expiry.Before(time.Now()) {
				ss := cp([]*registry.Service{service})
				ss[0].Nodes = []*registry.Node{node}

				if err := r.Registry.Deregister(ss[0]); err != nil {
					return nil, err
				}
				continue
			}

			nodes = append(nodes, node)
		}

		service.Nodes = nodes
	}

	return services, nil
}

func (r *registryWithExpiry) prune() {
	ticker := time.NewTicker(1 * time.Minute)
	for {
		select {
		case <-r.Registry.Options().Context.Done():
			return
		case <-ticker.C:
			r.ListServices()
		}
	}
}

type registryWithUnique struct {
	registry.Registry
}

func NewRegistryWithUnique(r registry.Registry) registry.Registry {
	return &registryWithUnique{Registry: r}
}

func (r *registryWithUnique) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	if config.Get("services", s.Name, "unique").Bool() {
		ss, err := r.GetService(s.Name)
		if err != nil {
			return err
		}
		if len(ss) > 0 {
			return errors.New("ErrServiceStartNeedsRetry - service already running")
		}
	}
	return r.Registry.Register(s, opts...)
}

type registryWithPeers struct {
	registry.Registry
}

func NewRegistryWithPeers(r registry.Registry) registry.Registry {
	return &registryWithPeers{
		Registry: r,
	}
}

func (r *registryWithPeers) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	for _, node := range s.Nodes {
		pydioregistry.GetPeer(node).Add(s, fmt.Sprintf("%d", node.Port))
	}
	return r.Registry.Register(s, opts...)
}

func (r *registryWithPeers) Deregister(s *registry.Service) error {
	for _, node := range s.Nodes {
		pydioregistry.GetPeer(node).Delete(s, fmt.Sprintf("%d", node.Port))
	}
	return r.Registry.Deregister(s)
}

type registryWithProcesses struct {
	registry.Registry
}

func NewRegistryWithProcesses(r registry.Registry) registry.Registry {
	return &registryWithProcesses{
		Registry: r,
	}
}

func (r *registryWithProcesses) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	for _, node := range s.Nodes {
		pydioregistry.GetProcess(node).Add(s.Name)
	}
	return r.Registry.Register(s, opts...)
}

func (r *registryWithProcesses) Deregister(s *registry.Service) error {
	for _, node := range s.Nodes {
		pydioregistry.GetProcess(node).Delete(s.Name)
	}
	return r.Registry.Deregister(s)
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
