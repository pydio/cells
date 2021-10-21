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

// Package registry provides the main glue between services
//
// It wraps micro registry (running services declared to the discovery server) into a more generic registry where all
// actual plugins are self-declared.
package registry

import (
	"sync"

	"github.com/micro/go-micro/registry"
)

type Peer struct {
	address  string
	hostname string

	// List of services associated
	lock     *sync.RWMutex
	register map[string]*registry.Service
}

func NewPeer(address string, nodeMeta ...map[string]string) *Peer {
	p := &Peer{
		address:  address,
		lock:     &sync.RWMutex{},
		register: make(map[string]*registry.Service),
	}
	if len(nodeMeta) > 0 {
		if h, ok := nodeMeta[0][serviceMetaHostname]; ok {
			p.hostname = h
		}
	}
	return p
}

// Add returns if the service was already registered
func (p *Peer) Add(c *registry.Service, id string) bool {
	p.lock.Lock()
	defer p.lock.Unlock()

	if _, ok := p.register[id]; ok {
		return false
	}

	p.register[id] = c
	return true
}

// Delete returns if the services existed before or not
func (p *Peer) Delete(c *registry.Service, id string) bool {
	p.lock.Lock()
	defer p.lock.Unlock()

	if _, ok := p.register[id]; !ok {
		return false
	}

	delete(p.register, id)
	return true
}

func (p *Peer) GetServices(name ...string) []*registry.Service {
	p.lock.RLock()
	defer p.lock.RUnlock()

	var y []*registry.Service
	for _, s := range p.register {
		if len(name) == 0 || name[0] == s.Name {
			y = append(y, s)
		}
	}

	return y
}

func (p *Peer) GetAddress() string {
	return p.address
}

func (p *Peer) GetHostname() string {
	return p.hostname
}
