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

// Package router provides api service routing
package router

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/micro/go-api"
	microrouter "github.com/micro/go-api/router"
	"github.com/micro/go-micro/registry"
	"github.com/pydio/cells/common/micro/rcache"
)

// router is the default router
type router struct {
	exit chan bool
	opts microrouter.Options

	// registry cache
	rc rcache.Cache

	sync.RWMutex
	eps map[string]*api.Service
}

func (r *router) isClosed() bool {
	select {
	case <-r.exit:
		return true
	default:
		return false
	}
}

// refresh list of api services
func (r *router) refresh() {
	var attempts int

	for {
		services, err := r.opts.Registry.ListServices()
		if err != nil {
			attempts++
			log.Println("Error listing endpoints", err)
			time.Sleep(time.Duration(attempts) * time.Second)
			continue
		}

		attempts = 0

		// for each service, get service and store endpoints
		for _, s := range services {
			// only get services for this namespace
			if !strings.HasPrefix(s.Name, r.opts.Namespace) {
				continue
			}
			service, err := r.rc.GetService(s.Name)
			if err != nil {
				continue
			}
			r.store(service)
		}

		// refresh list in 10 minutes... cruft
		select {
		case <-time.After(time.Minute * 10):
		case <-r.exit:
			return
		}
	}
}

// process watch event
func (r *router) process(res *registry.Result) {
	// skip these things
	if res == nil || res.Service == nil || !strings.HasPrefix(res.Service.Name, r.opts.Namespace) {
		return
	}

	// get entry from cache
	service, err := r.rc.GetService(res.Service.Name)
	if err != nil {
		return
	}

	// update our local endpoints
	r.store(service)
}

// store local endpoint cache
func (r *router) store(services []*registry.Service) {
	// endpoints
	eps := map[string]*api.Service{}

	// services
	names := map[string]bool{}

	// create a new endpoint mapping
	for _, service := range services {
		// set names we need later
		names[service.Name] = true

		// map per endpoint
		for _, endpoint := range service.Endpoints {
			// create a key service:endpoint_name
			key := fmt.Sprintf("%s:%s", service.Name, endpoint.Name)
			// decode endpoint
			end := api.Decode(endpoint.Metadata)

			// if we got nothing skip
			if err := api.Validate(end); err != nil {
				continue
			}

			// try get endpoint
			ep, ok := eps[key]
			if !ok {
				ep = &api.Service{Name: service.Name}
			}

			// overwrite the endpoint
			ep.Endpoint = end
			// append services
			ep.Services = append(ep.Services, service)
			// store it
			eps[key] = ep
		}
	}

	r.Lock()
	defer r.Unlock()

	// delete any existing eps for services we know
	for key, service := range r.eps {
		// skip what we don't care about
		if !names[service.Name] {
			continue
		}

		// ok we know this thing
		// delete delete delete
		delete(r.eps, key)
	}

	// now set the eps we have
	for name, endpoint := range eps {
		r.eps[name] = endpoint
	}
}

// watch for endpoint changes
func (r *router) watch() {
	var attempts int

	for {
		if r.isClosed() {
			return
		}

		// watch for changes
		w, err := r.opts.Registry.Watch()
		if err != nil {
			attempts++
			log.Println("Error watching endpoints", err)
			time.Sleep(time.Duration(attempts) * time.Second)
			continue
		}

		ch := make(chan bool)

		go func() {
			select {
			case <-ch:
				w.Stop()
			case <-r.exit:
				w.Stop()
			}
		}()

		// reset if we get here
		attempts = 0

		for {
			// process next event
			res, err := w.Next()
			if err != nil {
				log.Println("Error getting next endpoint", err)
				close(ch)
				break
			}
			r.process(res)
		}
	}
}

func (r *router) Options() microrouter.Options {
	return r.opts
}

func (r *router) Close() error {
	select {
	case <-r.exit:
		return nil
	default:
		close(r.exit)
		r.rc.Stop()
	}
	return nil
}

func (r *router) Endpoint(req *http.Request) (*api.Service, error) {
	if r.isClosed() {
		return nil, errors.New("router closed")
	}

	r.RLock()
	defer r.RUnlock()

	// use the first match
	// TODO: weighted matching
	for _, e := range r.eps {
		ep := e.Endpoint

		// match
		var pathMatch, hostMatch, methodMatch bool

		// 1. try method GET, POST, PUT, etc
		// 2. try host example.com, foobar.com, etc
		// 3. try path /foo/bar, /bar/baz, etc

		// 1. try match method
		for _, m := range ep.Method {
			if req.Method == m {
				methodMatch = true
				break
			}
		}

		// no match on method pass
		if len(ep.Method) > 0 && !methodMatch {
			continue
		}

		// 2. try match host
		for _, h := range ep.Host {
			if req.Host == h {
				hostMatch = true
				break
			}
		}

		// no match on host pass
		if len(ep.Host) > 0 && !hostMatch {
			continue
		}

		// 3. try match paths
		for _, p := range ep.Path {
			re, err := regexp.CompilePOSIX(p)
			if err == nil && re.MatchString(req.URL.Path) {
				pathMatch = true
				break
			}
		}

		// no match pass
		if len(ep.Path) > 0 && !pathMatch {
			continue
		}

		// TODO: Percentage traffic

		// we got here, so its a match
		return e, nil
	}

	// no match
	return nil, errors.New("not found")
}

func (r *router) Route(req *http.Request) (*api.Service, error) {
	if r.isClosed() {
		return nil, errors.New("router closed")
	}

	// only use endpoint matching when the meta handler is set aka api.Default
	switch r.opts.Handler {
	// meta handler
	case api.Default:
		// try get an endpoint from metadata
		if ep, err := r.Endpoint(req); err == nil {
			return ep, nil
		}

		// no ep found, shit; default to api handler

		// get service route
		name, method := apiRoute(r.opts.Namespace, req.URL.Path)
		// get service
		services, err := r.rc.GetService(name)
		if err != nil {
			return nil, err
		}

		// construct api service
		return &api.Service{
			Name: name,
			Endpoint: &api.Endpoint{
				Name:    method,
				Handler: api.Api,
			},
			Services: services,
		}, nil
	// http handler
	case api.Http, api.Proxy, api.Web:
		// get proxy route
		name := proxyRoute(r.opts.Namespace, req.URL.Path)
		// get service
		services, err := r.rc.GetService(name)
		if err != nil {
			return nil, err
		}
		// construct api service
		return &api.Service{
			Name: name,
			Endpoint: &api.Endpoint{
				Name:    req.URL.String(),
				Handler: r.opts.Handler,
				Host:    []string{req.Host},
				Method:  []string{req.Method},
				Path:    []string{req.URL.Path},
			},
			Services: services,
		}, nil
	// go-micro service handler
	case api.Api, api.Rpc:
		// get service route
		name, method := apiRoute(r.opts.Namespace, req.URL.Path)
		// get service
		services, err := r.rc.GetService(name)
		if err != nil {
			return nil, err
		}
		// construct api service
		return &api.Service{
			Name: name,
			Endpoint: &api.Endpoint{
				Name:    method,
				Handler: r.opts.Handler,
			},
			Services: services,
		}, nil
	}

	return nil, errors.New("unknown handler")
}

func newRouter(opts ...microrouter.Option) *router {
	options := newOptions(opts...)
	r := &router{
		exit: make(chan bool),
		opts: options,
		rc:   rcache.New(options.Registry),
		eps:  make(map[string]*api.Service),
	}
	go r.watch()
	go r.refresh()
	return r
}

// NewRouter returns the default router
func NewRouter(opts ...microrouter.Option) microrouter.Router {
	return newRouter(opts...)
}
