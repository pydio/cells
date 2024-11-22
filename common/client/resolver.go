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

	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/runtime"
)

type UpdateStateCallback func(registry.Registry) error

// ResolverCallback is a generic watcher for registry, that rebuilds the list of
// available targets and calls the passed callbacks on change event.
// It is used by both grpc and http balancers.
type ResolverCallback interface {
	Add(UpdateStateCallback)
	Stop()
}

type ResolverCallbackOptions struct {
	Timer   time.Duration
	Types   []pb.ItemType
	Actions []pb.ActionType
}

type ResolverCallbackOption func(*ResolverCallbackOptions)

func WithTimer(timer time.Duration) ResolverCallbackOption {
	return func(opts *ResolverCallbackOptions) {
		opts.Timer = timer
	}
}

func WithTypes(types ...pb.ItemType) ResolverCallbackOption {
	return func(opts *ResolverCallbackOptions) {
		opts.Types = append(opts.Types, types...)
	}
}

func WithActions(actions ...pb.ActionType) ResolverCallbackOption {
	return func(opts *ResolverCallbackOptions) {
		opts.Actions = append(opts.Actions, actions...)
	}
}

type resolverCallback struct {
	localAddr string
	reg       registry.Registry
	ml        *sync.RWMutex

	opts ResolverCallbackOptions

	local registry.Registry

	updatedStateTimer *time.Timer
	cbs               []UpdateStateCallback

	done chan bool
	w    registry.Watcher
}

// NewResolverCallback creates a new ResolverCallback watching the passed registry.Registry
func NewResolverCallback(reg registry.Registry, opts ...ResolverCallbackOption) (ResolverCallback, error) {
	local, err := registry.OpenRegistry(context.Background(), "mem://")
	if err != nil {
		return nil, err
	}

	o := ResolverCallbackOptions{}
	for _, opt := range opts {
		opt(&o)
	}

	if len(o.Types) == 0 {
		o.Types = []pb.ItemType{
			pb.ItemType_SERVER,
			pb.ItemType_SERVICE,
			pb.ItemType_EDGE,
			pb.ItemType_ADDRESS,
			pb.ItemType_ENDPOINT,
		}
	}
	if o.Timer == 0 {
		o.Timer = 50 * time.Millisecond
	}

	r := &resolverCallback{
		localAddr: runtime.DefaultAdvertiseAddress(),
		done:      make(chan bool, 1),
		local:     local,
		opts:      o,
	}
	r.reg = reg
	r.ml = &sync.RWMutex{}
	r.updatedStateTimer = time.NewTimer(o.Timer)

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
	var opts []registry.Option
	if len(r.opts.Types) > 0 {
		for _, t := range r.opts.Types {
			opts = append(opts, registry.WithType(t))
		}
	}

	if len(r.opts.Actions) > 0 {
		for _, a := range r.opts.Actions {
			opts = append(opts, registry.WithAction(a))
		}
	}

	w, err := r.reg.Watch(opts...)
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

		r.updatedStateTimer.Reset(r.opts.Timer)
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
	for _, cb := range r.cbs {
		cb(r.local)
	}
}
