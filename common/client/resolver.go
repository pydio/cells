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
	"context"
	"sync"
	"time"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
)

type UpdateStateCallback func(registry.Registry) error

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

	local registry.Registry

	updatedStateTimer *time.Timer
	cbs               []UpdateStateCallback

	done chan bool
	w    registry.Watcher
}

// NewResolverCallback creates a new ResolverCallback watching the passed registry.Registry
func NewResolverCallback(reg registry.Registry) (ResolverCallback, error) {
	local, err := registry.OpenRegistry(context.Background(), "mem://")
	if err != nil {
		return nil, err
	}

	r := &resolverCallback{
		localAddr: runtime.DefaultAdvertiseAddress(),
		done:      make(chan bool, 1),
		local:     local,
	}
	r.reg = reg
	r.ml = &sync.RWMutex{}
	r.updatedStateTimer = time.NewTimer(50 * time.Millisecond)

	go r.updateState()
	go r.watch()

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

		r.ml.Lock()
		if res.Action() == pb.ActionType_CREATE || res.Action() == pb.ActionType_UPDATE {
			for _, item := range res.Items() {
				r.local.Register(item)
			}
		} else if res.Action() == pb.ActionType_DELETE {
			for _, item := range res.Items() {
				r.local.Deregister(item)
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
	//r.ml.RLock()

	//// fmt.Println("Sending state - Number of items ", len(r.items))
	//srvs, _ := r.local.List(registry.WithType(pb.ItemType_SERVER))
	//
	//items := make(LinkedItem)
	//
	//for _, srv := range srvs {
	//	// TODO - do something with the attributes
	//	//atts := attributes.New(attKeyTargetServerID{}, srv.ID())
	//	//if pid, ok := srv.Metadata()[runtime.NodeMetaPID]; ok {
	//	//	atts = atts.WithValue(attKeyTargetServerPID{}, pid)
	//	//}
	//
	//	items[srv] = make(LinkedItem)
	//
	//	adjacents := r.local.ListAdjacentItems(srv,
	//		registry.WithType(pb.ItemType_ADDRESS),
	//		registry.WithType(pb.ItemType_ENDPOINT),
	//		registry.WithType(pb.ItemType_SERVICE),
	//	)
	//
	//	for _, adjacent := range adjacents {
	//		switch util.DetectType(adjacent) {
	//		case pb.ItemType_ADDRESS:
	//			items[srv][adjacent] = nil
	//		case pb.ItemType_ENDPOINT:
	//			items[srv][adjacent] = make(LinkedItem)
	//
	//			adjacentServices := r.local.ListAdjacentItems(adjacent, registry.WithType(pb.ItemType_SERVICE))
	//			for _, adjacentService := range adjacentServices {
	//				items[srv][adjacent][adjacentService] = nil
	//			}
	//		case pb.ItemType_SERVICE:
	//			items[srv][adjacent] = make(LinkedItem)
	//
	//			adjacentEndpoints := r.local.ListAdjacentItems(adjacent, registry.WithType(pb.ItemType_ENDPOINT))
	//			for _, adjacentEndpoint := range adjacentEndpoints {
	//				items[srv][adjacent][adjacentEndpoint] = nil
	//			}
	//		}
	//	}
	//}

	//r.ml.RUnlock()

	for _, cb := range r.cbs {
		cb(r.local)
	}
}
