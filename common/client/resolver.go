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

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

type ServerAttributes struct {
	Name      string
	Addresses []string
	Services  []string
	Endpoints []string
}

type UpdateStateCallback func(map[string]*ServerAttributes) error

type ResolverCallback interface {
	Add(UpdateStateCallback)
	Stop()
}

type resolverCallback struct {
	reg   registry.Registry
	ml    *sync.RWMutex
	items []registry.Item

	updatedStateTimer *time.Timer
	cbs               []UpdateStateCallback

	done chan bool
	w    registry.Watcher
}

func NewResolverCallback(reg registry.Registry) (ResolverCallback, error) {
	/*items, err := reg.List()
	if err != nil {
		return nil, err
	}*/

	r := &resolverCallback{
		done: make(chan bool, 1),
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
			//fmt.Println("sendState for", srv.Name(), len(addresses), "addresses, ", len(endpoints), "endpoints")
			m[srv.ID()] = &ServerAttributes{
				Name:      srv.Name(),
				Addresses: addresses,
				Endpoints: endpoints,
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
