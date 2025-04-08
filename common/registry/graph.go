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

package registry

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"sort"
	"strings"
	"sync"

	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

type graphRegistry struct {
	id string
	r  RawRegistry

	ww map[string]StatusWatcher
	wl sync.Mutex
}

func GraphRegistry(r RawRegistry) Registry {
	return &graphRegistry{
		id: uuid.New(),
		r:  r,
		ww: make(map[string]StatusWatcher),
	}
}

func (r *graphRegistry) Start(i Item) error {
	return r.r.Start(i)
}

func (r *graphRegistry) Stop(i Item) error {
	return r.r.Stop(i)
}

func (r *graphRegistry) Close() error {
	return r.r.Close()
}

func (r *graphRegistry) Done() <-chan struct{} {
	return r.r.Done()
}

// Register wraps internal registry.Register call and create Edges and Watches based on RegisterOptions
func (r *graphRegistry) Register(i Item, option ...RegisterOption) error {
	opt := &RegisterOptions{Watch: i}
	for _, o := range option {
		o(opt)
	}
	// Register main service
	if er := r.r.Register(i, option...); er != nil {
		return er
	}
	// If there are edges, register them
	for _, e := range opt.Edges {
		if _, er := r.RegisterEdge(i.ID(), e.Id, e.Label, e.Meta); er != nil {
			return er
		}
	}
	// If flag Watch is set, try to convert item
	if opt.Watch == nil {
		return nil
	}
	var sr StatusReporter
	if opt.Watch == i {
		i.As(&sr)
	} else if s, ok := opt.Watch.(StatusReporter); ok {
		sr = s
	}
	if sr != nil {
		go r.startWatcher(i.ID(), sr)
	}
	return nil
}

// Deregister wraps internal registry Deregister call by clearing possible Edges to the service.
// It also clears the associated watcher if there is one.
func (r *graphRegistry) Deregister(i Item, option ...RegisterOption) error {
	r.wl.Lock()
	if w, ok := r.ww[i.ID()]; ok {
		w.Stop()
		delete(r.ww, i.ID())
	}
	r.wl.Unlock()
	if er := r.r.Deregister(i, option...); er != nil {
		return er
	}
	edges, err := r.clearEdges(i, option...)

	for _, edge := range edges {
		// Removing other edge if it was a dependence to the item
		if edge.Vertices()[1] == i.ID() {
			if item, _ := r.r.Get(edge.Vertices()[0],
				WithType(pb.ItemType_ADDRESS),
				WithType(pb.ItemType_ENDPOINT),
				WithType(pb.ItemType_DAO),
				WithType(pb.ItemType_GENERIC),
				WithType(pb.ItemType_TAG),
				WithType(pb.ItemType_SERVER),
				WithType(pb.ItemType_SERVICE),
				WithType(pb.ItemType_PROCESS),
				WithType(pb.ItemType_STATS),
			); item != nil {
				if err := r.r.Deregister(item); err != nil {
					return err
				}
			}
		}
	}
	return err
}

func (r *graphRegistry) RegisterEdge(item1, item2, edgeLabel string, metadata map[string]string, oo ...RegisterOption) (Edge, error) {

	// Make id unique for an item1+item2 pair
	pair := []string{item1, item2}
	sort.Strings(pair)
	h := md5.New()
	h.Write([]byte(edgeLabel))
	h.Write([]byte(strings.Join(pair, "-")))
	id := hex.EncodeToString(h.Sum(nil))

	e := &edge{
		id:       id,
		name:     edgeLabel,
		metadata: metadata,
		vertices: []string{item1, item2},
	}
	if e.metadata == nil {
		e.metadata = map[string]string{}
	}
	return e, r.r.Register(e, oo...)
}

func (r *graphRegistry) ListAdjacentItems(opts ...AdjacentItemOption) (items []Item) {

	opt := &AdjacentItemOptions{}
	for _, o := range opts {
		o(opt)
	}

	if len(opt.edgeItems) == 0 {
		opt.edgeItems, _ = r.List(append(opt.edgeOptions, WithType(pb.ItemType_EDGE))...)
	}

	if len(opt.sourceItems) == 0 {
		opt.sourceItems, _ = r.List(opt.sourceOptions...)
	}

	if len(opt.targetItems) == 0 {
		opt.targetItems, _ = r.List(opt.targetOptions...)
	}

	var ids []string
	for _, e := range opt.edgeItems {
		edg, ok := e.(Edge)
		if !ok {
			continue
		}

		for _, sourceItem := range opt.sourceItems {
			vv := edg.Vertices()
			if vv[0] == sourceItem.ID() {
				ids = append(ids, vv[1])
			} else if vv[1] == sourceItem.ID() {
				ids = append(ids, vv[0])
			}
		}
	}
	if len(ids) == 0 {
		return
	}
	for _, id := range ids {
		for _, i := range opt.targetItems {
			if i == nil {
				// fmt.Println("This is nil ? ", i)
				continue
			}
			if i.ID() == id {
				items = append(items, i)
				break
			}
		}
	}
	return
}

// startWatcher starts a watcher on a StatusReporter service
func (r *graphRegistry) startWatcher(id string, sr StatusReporter) {
	w, err := sr.WatchStatus()
	if err != nil {
		return
	}
	r.wl.Lock()
	r.ww[id] = w
	r.wl.Unlock()
	for {
		sItem, er := w.Next()
		if er != nil {
			break
		}
		er = r.Register(sItem, WithEdgeTo(id, sItem.Name(), map[string]string{}))
		if er != nil {
			fmt.Println("[ERROR] Cannot register watched event", er.Error())
		} else {
			//fmt.Println("[INFO] Updating item received from statusWatcher")
		}
	}
}

// clearEdges looks for links that are pointing to this sourceItem
func (r *graphRegistry) clearEdges(sourceItem Item, oo ...RegisterOption) ([]Edge, error) {
	lo := []Option{
		WithType(pb.ItemType_EDGE),
	}
	// Convert RegisterFailFast to ListFailFast as well
	opt := &RegisterOptions{}
	for _, o := range oo {
		o(opt)
	}
	if opt.FailFast {
		lo = append(lo, WithFailFast())
	}

	var out []Edge
	edges := make(map[string]Edge)
	ee, er := r.r.List(lo...)
	if er != nil {
		return nil, er
	}
	for _, e := range ee {
		edg, ok := e.(Edge)
		if !ok {
			continue
		}
		vv := edg.Vertices()
		if vv[0] == sourceItem.ID() || vv[1] == sourceItem.ID() {
			edges[edg.ID()] = edg
		}
	}
	if len(edges) == 0 {
		return out, nil
	}
	for _, e := range edges {
		if er := r.r.Deregister(e, oo...); er != nil {
			return out, nil
		} else {
			out = append(out, e)
		}
	}

	return out, nil
}

func (r *graphRegistry) Get(s string, opts ...Option) (Item, error) {
	return r.r.Get(s, opts...)
}

func (r *graphRegistry) List(opts ...Option) ([]Item, error) {
	return r.r.List(opts...)
}

func (r *graphRegistry) Watch(option ...Option) (Watcher, error) {
	return r.r.Watch(option...)
}

func (r *graphRegistry) NewLocker(name string) sync.Locker {
	return r.r.NewLocker(name)
}

func (r *graphRegistry) As(i interface{}) bool {
	return r.r.As(i)
}
