/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	address string

	// List of services associated
	lock     *sync.RWMutex
	register []*registry.Service
}

func NewPeer(address string) *Peer {
	return &Peer{
		address: address,
		lock:    &sync.RWMutex{},
	}
}

func (p *Peer) Add(c *registry.Service) {
	p.lock.Lock()
	defer p.lock.Unlock()

	new := filter(p.register, c)
	new = append(new, c)

	p.register = new
}

func (p *Peer) Delete(c *registry.Service) {
	p.lock.Lock()
	defer p.lock.Unlock()

	new := filter(p.register, c)
	new = append(new, c)

	p.register = new
}

func filter(all []*registry.Service, n *registry.Service) []*registry.Service {
	y := all[:0]

	for _, s := range all {
		if s.Name != n.Name {
			y = append(y, s)
		}
	}

	return y
}
