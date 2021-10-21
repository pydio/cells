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

package http

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/micro/go-api"
	"github.com/micro/go-api/handler"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
)

type httpHandler struct {
	options handler.Options

	// set with different initialiser
	s *api.Service
}

func (h *httpHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	service, err := h.getService(r)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	if service == nil || len(service.Nodes) == 0 {
		w.WriteHeader(404)
		return
	}

	node := service.Nodes[0]

	target, err := url.Parse(fmt.Sprintf("http://%s:%d", node.Address, node.Port))
	if err != nil {
		w.WriteHeader(500)
		return
	}

	rp := httputil.NewSingleHostReverseProxy(target)
	rp.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		if err != nil && strings.Contains(err.Error(), "connection refused") {
			h.options.Router.Options().Registry.Deregister(service)

			w.Header().Add("Retry-After", "1")
			w.WriteHeader(http.StatusServiceUnavailable)
		}
	}

	rp.ServeHTTP(w, r)
}

// getService returns the service for this request from the selector
func (h *httpHandler) getService(r *http.Request) (*registry.Service, error) {
	var service *api.Service

	if h.s != nil {
		// we were given the service
		service = h.s
	} else if h.options.Router != nil {
		// try get service from router
		s, err := h.options.Router.Route(r)
		if err != nil {
			return nil, err
		}
		service = s
	} else {
		// we have no way of routing the request
		return nil, errors.New("no route found")
	}

	// create a random selector
	next := selector.Random(service.Services)

	// get the next node
	chosen, err := next()
	if err != nil {
		return nil, nil
	}

	var s *registry.Service
	// retrieve service
	for _, srv := range service.Services {
		for _, node := range srv.Nodes {
			if chosen.Id == node.Id {
				s = h.cp([]*registry.Service{srv})[0]
				s.Nodes = []*registry.Node{node}
			}
		}
	}

	return s, nil
}

func (h *httpHandler) String() string {
	return "http"
}

// cp copies a service. Because we're caching handing back pointers would
// create a race condition, so we do this instead
// its fast enough
func (h *httpHandler) cp(current []*registry.Service) []*registry.Service {
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

// NewHandler returns a http proxy handler
func NewHandler(opts ...handler.Option) handler.Handler {
	options := handler.NewOptions(opts...)

	return &httpHandler{
		options: options,
	}
}

// WithService creates a handler with a service
func WithService(s *api.Service, opts ...handler.Option) handler.Handler {
	options := handler.NewOptions(opts...)

	return &httpHandler{
		options: options,
		s:       s,
	}
}
