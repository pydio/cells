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
	"sync"
	"time"

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
	items     []registry.Item

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
		registry.WithAction(pb.ActionType_FULL_LIST),
		registry.WithType(pb.ItemType_SERVER),
		registry.WithType(pb.ItemType_SERVICE),
		registry.WithType(pb.ItemType_EDGE),
	)
	if err != nil {
		return
	}

	for {
		res, err := w.Next()
		if err != nil {
			return
		}

		r.ml.Lock()
		r.items = res.Items()
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
	services := make(map[string]registry.Service)
	var edges []registry.Edge

	//items, err := r.reg.List(
	//	registry.WithType(pb.ItemType_SERVER),
	//	registry.WithType(pb.ItemType_SERVICE),
	//	registry.WithType(pb.ItemType_EDGE),
	//)
	//if err != nil {
	//	return
	//}

	r.ml.RLock()
	for _, v := range r.items {
		var srv registry.Server
		var edge registry.Edge
		var service registry.Service
		if v.As(&srv) {
			var addresses, endpoints []string
			for _, a := range r.reg.ListAdjacentItems(srv, registry.WithType(pb.ItemType_ADDRESS)) {
				addresses = append(addresses, a.Name())
			}
			for _, e := range r.reg.ListAdjacentItems(srv, registry.WithType(pb.ItemType_ENDPOINT)) {
				endpoints = append(endpoints, e.Name())
			}
			atts := attributes.New(attKeyTargetServerID{}, srv.ID())
			if pid, ok := srv.Metadata()[runtime.NodeMetaPID]; ok {
				atts = atts.WithValue(attKeyTargetServerPID{}, pid)
			}
			m[srv.ID()] = &ServerAttributes{
				Name:               srv.Name(),
				Addresses:          addresses,
				Endpoints:          endpoints,
				BalancerAttributes: atts,
			}
		} else if v.As(&edge) {
			edges = append(edges, edge)
		} else if v.As(&service) {
			services[service.ID()] = service
		}
	}

	for id, attr := range m {
		var srvIds []string
		for _, e := range edges {
			vv := e.Vertices()
			if vv[0] == id {
				srvIds = append(srvIds, vv[1])
			} else if vv[1] == id {
				srvIds = append(srvIds, vv[0])
			}
		}
		for _, srvId := range srvIds {
			if srv, ok := services[srvId]; ok {
				attr.Services = append(attr.Services, srv.Name())
			}
		}
	}

	r.ml.RUnlock()

	for _, cb := range r.cbs {
		cb(m)
	}
}
