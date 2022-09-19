/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package client

import (
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/pydio/cells/v4/common/registry/util"

	"google.golang.org/grpc/attributes"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
)

type ServerAttributes struct {
	Name               string
	Addresses          []string
	Services           []string
	Endpoints          []string
	BalancerAttributes *attributes.Attributes
}

type UpdateStateCallback func(map[string]*ServerAttributes) error

// ResolverCallback is a generic watcher for registry, that rebuilds the list of
// available targets and calls the passed callbacks on change event.
// It is used by both grpc and http balancers.
type ResolverCallback interface {
	Add(UpdateStateCallback)
	Stop()
}

type resolverCallback struct {
	localAddr string
	reg       registry.Registry
	ml        *sync.RWMutex

	servers   map[string]registry.Server
	services  map[string]registry.Service
	edges     map[string]registry.Edge
	addresses map[string]registry.Generic
	endpoints map[string]registry.Generic

	updatedStateTimer *time.Timer
	cbs               []UpdateStateCallback

	done chan bool
	w    registry.Watcher
}

// NewResolverCallback creates a new ResolverCallback watching the passed registry.Registry
func NewResolverCallback(reg registry.Registry) (ResolverCallback, error) {

	r := &resolverCallback{
		localAddr: runtime.DefaultAdvertiseAddress(),
		done:      make(chan bool, 1),
		servers:   make(map[string]registry.Server),
		services:  make(map[string]registry.Service),
		edges:     make(map[string]registry.Edge),
		addresses: make(map[string]registry.Generic),
		endpoints: make(map[string]registry.Generic),
	}
	r.reg = reg
	r.ml = &sync.RWMutex{}
	r.updatedStateTimer = time.NewTimer(50 * time.Millisecond)

	go r.updateState()
	go r.watch()

	/*r.ml.Lock()
	r.items = items
	r.ml.Unlock()*/

	return r, nil
}

func (r *resolverCallback) Stop() {
	if r.w != nil {
		r.w.Stop()
	}
	close(r.done)
}

func (r *resolverCallback) Add(cb UpdateStateCallback) {
	r.cbs = append(r.cbs, cb)
}

func (r *resolverCallback) watch() {
	w, err := r.reg.Watch(
		registry.WithType(pb.ItemType_SERVER),
		registry.WithType(pb.ItemType_SERVICE),
		registry.WithType(pb.ItemType_EDGE),
		registry.WithType(pb.ItemType_ADDRESS),
		registry.WithType(pb.ItemType_ENDPOINT),
	)
	if err != nil {
		return
	}

	for {
		res, err := w.Next()
		if err != nil {
			return
		}

		for _, item := range res.Items() {
			if util.DetectType(item) == pb.ItemType_SERVICE {
				fmt.Println("Received event ", os.Args, res.Action(), item.Name())
			}
		}

		r.ml.Lock()
		if res.Action() == pb.ActionType_CREATE || res.Action() == pb.ActionType_UPDATE {
			for _, item := range res.Items() {
				switch util.DetectType(item) {
				case pb.ItemType_SERVER:
					var s registry.Server
					if item.As(&s) {
						r.servers[item.ID()] = s
					}
				case pb.ItemType_SERVICE:
					var s registry.Service
					if item.As(&s) {
						r.services[item.ID()] = s
					}
				case pb.ItemType_EDGE:
					var e registry.Edge
					if item.As(&e) {
						// Don't really care for edge update
						if res.Action() == pb.ActionType_UPDATE {
							continue
						}

						r.edges[item.ID()] = e
					}
				case pb.ItemType_ADDRESS:
					var g registry.Generic
					if item.As(&g) {
						r.addresses[item.ID()] = g
					}
				case pb.ItemType_ENDPOINT:
					var g registry.Generic
					if item.As(&g) {
						r.endpoints[item.ID()] = g
					}
				}
			}
		} else if res.Action() == pb.ActionType_DELETE {
			for _, item := range res.Items() {
				switch util.DetectType(item) {
				case pb.ItemType_SERVER:
					delete(r.servers, item.ID())
				case pb.ItemType_SERVICE:
					delete(r.services, item.ID())
				case pb.ItemType_EDGE:
					delete(r.edges, item.ID())
				case pb.ItemType_ADDRESS:
					delete(r.addresses, item.ID())
				case pb.ItemType_ENDPOINT:
					delete(r.endpoints, item.ID())
				}
			}
		}
		r.ml.Unlock()

		r.updatedStateTimer.Reset(50 * time.Millisecond)
	}
}

func (r *resolverCallback) updateState() {
	for {
		select {
		case <-r.updatedStateTimer.C:
			r.sendState()
		case <-r.done:
			return
		}
	}
}

func (r *resolverCallback) sendState() {
	var m = make(map[string]*ServerAttributes)

	r.ml.RLock()

	for _, srv := range r.servers {
		atts := attributes.New(attKeyTargetServerID{}, srv.ID())
		if pid, ok := srv.Metadata()[runtime.NodeMetaPID]; ok {
			atts = atts.WithValue(attKeyTargetServerPID{}, pid)
		}
		m[srv.ID()] = &ServerAttributes{
			Name:               srv.Name(),
			BalancerAttributes: atts,
		}
	}

	for srvID, attr := range m {
		var ids []string
		for _, e := range r.edges {
			vv := e.Vertices()
			if vv[0] == srvID {
				ids = append(ids, vv[1])
			} else if vv[1] == srvID {
				ids = append(ids, vv[0])
			}
		}
		for _, id := range ids {
			if svc, ok := r.services[id]; ok {
				attr.Services = append(attr.Services, svc.Name())
			}
			if addr, ok := r.addresses[id]; ok {
				attr.Addresses = append(attr.Addresses, addr.Name())
			}
			if endpoint, ok := r.endpoints[id]; ok {
				attr.Endpoints = append(attr.Endpoints, endpoint.Name())
			}
		}
	}

	r.ml.RUnlock()

	for _, cb := range r.cbs {
		cb(m)
	}
}
