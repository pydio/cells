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

// Package cache is a caching selector. It uses the registry watcher.
package cache

import (
	"math/rand"
	"sync"
	"time"

	log "github.com/micro/go-log"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
)

type cacheSelector struct {
	so  selector.Options
	ttl time.Duration

	// registry cache
	sync.Mutex
	cache map[string][]*registry.Service
	ttls  map[string]time.Time

	watched map[string]bool

	nodesInErrorLock *sync.RWMutex
	nodesInError     map[string]int

	// used to close or reload watcher
	reload chan bool
	exit   chan bool
}

var (
	DefaultTTL = time.Minute
)

func (c *cacheSelector) quit() bool {
	select {
	case <-c.exit:
		return true
	default:
		return false
	}
}

// cp copies a service. Because we're caching handing back pointers would
// create a race condition, so we do this instead
// its fast enough
func (c *cacheSelector) cp(current []*registry.Service) []*registry.Service {
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

func (c *cacheSelector) del(service string) {
	delete(c.cache, service)
	delete(c.ttls, service)
}

func (c *cacheSelector) get(service string) ([]*registry.Service, error) {
	c.Lock()
	defer c.Unlock()

	// get does the actual request for a service
	// it also caches it
	get := func(service string) ([]*registry.Service, error) {
		// ask the registry
		services, err := c.so.Registry.GetService(service)
		if err != nil {
			return nil, err
		}

		// cache results
		c.set(service, c.cp(services))
		return services, nil
	}

	// check the cache first
	services, ok := c.cache[service]

	// cache miss or no services
	if !ok || len(services) == 0 {
		return get(service)
	}

	// got cache but lets check ttl
	ttl, kk := c.ttls[service]

	// within ttl so return cache
	if kk && time.Since(ttl) < c.ttl {
		return c.cp(services), nil
	}

	// expired entry so get service
	services, err := get(service)

	// no error then return error
	if err == nil {
		return services, nil
	}

	// not found error then return
	if err == registry.ErrNotFound {
		return nil, selector.ErrNotFound
	}

	// other error

	// return expired cache as last resort
	return c.cp(services), nil
}

func (c *cacheSelector) set(service string, services []*registry.Service) {
	c.cache[service] = services
	c.ttls[service] = time.Now().Add(c.ttl)
}

func (c *cacheSelector) update(res *registry.Result) {
	if res == nil || res.Service == nil {
		return
	}

	c.Lock()
	defer c.Unlock()

	services, ok := c.cache[res.Service.Name]
	if !ok {
		// we're not going to cache anything
		// unless there was already a lookup
		return
	}

	if len(res.Service.Nodes) == 0 {
		switch res.Action {
		case "delete":
			c.del(res.Service.Name)
		}
		return
	}

	// existing service found
	var service *registry.Service
	var index int
	for i, s := range services {
		if s.Version == res.Service.Version {
			service = s
			index = i
		}
	}

	switch res.Action {
	case "create", "update":
		if service == nil {
			c.set(res.Service.Name, append(services, res.Service))
			return
		}

		// append old nodes to new service
		for _, cur := range service.Nodes {
			var seen bool
			for _, node := range res.Service.Nodes {
				if cur.Id == node.Id {
					seen = true
					break
				}
			}
			if !seen {
				res.Service.Nodes = append(res.Service.Nodes, cur)
			}
		}

		services[index] = res.Service
		c.set(res.Service.Name, services)
	case "delete":
		if service == nil {
			return
		}

		var nodes []*registry.Node

		// filter cur nodes to remove the dead one
		for _, cur := range service.Nodes {
			var seen bool
			for _, del := range res.Service.Nodes {
				if del.Id == cur.Id {
					seen = true
					break
				}
			}
			if !seen {
				nodes = append(nodes, cur)
			}
		}

		// still got nodes, save and return
		if len(nodes) > 0 {
			service.Nodes = nodes
			services[index] = service
			c.set(service.Name, services)
			return
		}

		// zero nodes left

		// only have one thing to delete
		// nuke the thing
		if len(services) == 1 {
			c.del(service.Name)
			return
		}

		// still have more than 1 service
		// check the version and keep what we know
		var srvs []*registry.Service
		for _, s := range services {
			if s.Version != service.Version {
				srvs = append(srvs, s)
			}
		}

		// save
		c.set(service.Name, srvs)
	}
}

// run starts the cache watcher loop
// it creates a new watcher if there's a problem
// reloads the watcher if Init is called
// and returns when Close is called
func (c *cacheSelector) run() {
	for {
		// exit early if already dead
		if c.quit() {
			return
		}

		// create new watcher
		w, err := c.so.Registry.Watch()
		if err != nil {
			if c.quit() {
				return
			}
			log.Log(err)
			time.Sleep(time.Second)
			continue
		}

		// watch for events
		if err := c.watch(w); err != nil {
			if c.quit() {
				return
			}
			// log.Log(err)
			continue
		}
	}
}

// watch loops the next event and calls update
// it returns if there's an error
func (c *cacheSelector) watch(w registry.Watcher) error {
	defer w.Stop()

	// manage this loop
	go func() {
		// wait for exit or reload signal
		select {
		case <-c.exit:
		case <-c.reload:
		}

		// stop the watcher
		w.Stop()
	}()

	for {
		res, err := w.Next()
		if err != nil {
			return err
		}

		c.update(res)
	}
}

func (c *cacheSelector) Init(opts ...selector.Option) error {
	for _, o := range opts {
		o(&c.so)
	}

	// reload the watcher
	go func() {
		select {
		case <-c.exit:
			return
		default:
			c.reload <- true
		}
	}()

	return nil
}

func (c *cacheSelector) Options() selector.Options {
	return c.so
}

func (c *cacheSelector) Select(service string, opts ...selector.SelectOption) (selector.Next, error) {
	sopts := selector.SelectOptions{
		Strategy: c.so.Strategy,
	}

	for _, opt := range opts {
		opt(&sopts)
	}

	// get the service
	// try the cache first
	// if that fails go directly to the registry
	i := 0
	for {
		if i == 5 {
			break
		}

		services, err := c.get(service)
		if err != nil {
			return nil, err
		}

		// apply the filters
		for _, filter := range sopts.Filters {
			services = filter(services)
		}

		// if there's nothing left, return
		if len(services) > 0 {
			return sopts.Strategy(services), nil
		}

		time.Sleep(1 * time.Second)
		i++
	}

	return nil, selector.ErrNoneAvailable
}

func (c *cacheSelector) Mark(service string, node *registry.Node, err error) {
	return
}

func (c *cacheSelector) Reset(service string) {
	return
}

// Close stops the watcher and destroys the cache
func (c *cacheSelector) Close() error {
	c.Lock()
	c.cache = make(map[string][]*registry.Service)
	c.watched = make(map[string]bool)
	c.Unlock()

	select {
	case <-c.exit:
		return nil
	default:
		close(c.exit)
	}
	return nil
}

func (c *cacheSelector) String() string {
	return "cache"
}

func NewSelector(opts ...selector.Option) selector.Selector {
	c := &cacheSelector{
		watched:          make(map[string]bool),
		cache:            make(map[string][]*registry.Service),
		ttls:             make(map[string]time.Time),
		nodesInErrorLock: &sync.RWMutex{},
		nodesInError:     make(map[string]int),
		reload:           make(chan bool, 1),
		exit:             make(chan bool),
	}

	sopts := selector.Options{}
	for _, opt := range opts {
		opt(&sopts)
	}

	if sopts.Strategy == nil {
		// sopts.Strategy = c.WeighedRandom(3)
		sopts.Strategy = selector.Random
	}

	if sopts.Registry == nil {
		sopts.Registry = registry.DefaultRegistry
	}

	ttl := DefaultTTL

	if sopts.Context != nil {
		if t, ok := sopts.Context.Value(ttlKey{}).(time.Duration); ok {
			ttl = t
		}
	}

	c.so = sopts
	c.ttl = ttl

	go c.run()

	return c
}

// WeighedRandom is a specific random strategy that favour nodes that have been more available
func (c *cacheSelector) WeighedRandom(maxErrors int) selector.Strategy {
	return func(services []*registry.Service) selector.Next {
		var nodes []*registry.Node

		for _, service := range services {
			for _, node := range service.Nodes {
				cnt, ok := c.nodesInError[node.Id]
				if !ok {
					cnt = 0
				}
				for i := 0; i < maxErrors-cnt; i++ {
					nodes = append(nodes, node)
				}
			}
		}

		return func() (*registry.Node, error) {
			if len(nodes) == 0 {
				return nil, selector.ErrNoneAvailable
			}

			i := rand.Int() % len(nodes)
			return nodes[i], nil
		}
	}
}
