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

package routes

import (
	"context"
	"fmt"
	"net/http"
	"path"
	"strings"
	"sync"

	"github.com/pydio/cells/v4/common/log"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

var (
	declaredRoutes []*subRoute
)

type ctxResolvedRouteURI struct{}

type RouteOptions struct {
	DefaultURI     string
	CustomResolver func(ctx context.Context) string
	NoSubPath      bool
}

type RouteOption func(o *RouteOptions)

func WithCustomResolver(r func(ctx context.Context) string) RouteOption {
	return func(o *RouteOptions) {
		o.CustomResolver = r
	}
}

func WithoutSubPathSupport() RouteOption {
	return func(o *RouteOptions) {
		o.NoSubPath = true
	}
}

// ResolvedURIFromContext reads resolved URI from context
func ResolvedURIFromContext(ctx context.Context) string {
	return ctx.Value(ctxResolvedRouteURI{}).(string)
}

func DeclareRoute(id, description, defaultURI string, opts ...RouteOption) {
	opt := &RouteOptions{}
	for _, o := range opts {
		o(opt)
	}
	declaredRoutes = append(declaredRoutes, &subRoute{
		id:             id,
		description:    description,
		uri:            defaultURI,
		customResolver: opt.CustomResolver,
		subPathSupport: !opt.NoSubPath,
	})
}

type HttpMux interface {
	Handler(r *http.Request) (h http.Handler, pattern string)
	ServeHTTP(w http.ResponseWriter, r *http.Request)
}

type RouteRegistrar interface {
	Route(uri string) Route
	Patterns() []string
	DeregisterPattern(pattern string)
	ResolveMux(ctx context.Context) (HttpMux, error)
}

type Route interface {
	// Handle registers a handler
	Handle(pattern string, handler http.Handler)
	// HandleStripPrefix registers a handler wrapped in http.StripPrefix (full URI)
	HandleStripPrefix(pattern string, handler http.Handler)
}

type RequestRewriter func(r *http.Request)

func NewRouteRegistrar() RouteRegistrar {
	return &registrar{}
}

type registrar struct {
	routes []*subRoute
}

func (h *registrar) ResolveMux(ctx context.Context) (HttpMux, error) {
	mu := http.NewServeMux()
	logCtx := servicecontext.WithServiceName(ctx, "pydio.web.mux")
	for _, r := range h.routes {
		log.Logger(logCtx).Info("ROUTE " + r.id)
		r.patternsMutex.RLock()
		for routePattern, registered := range r.patternsCache {
			pattern, handler, prefix := registered.attach(r.URI(ctx), routePattern)
			if prefix != "" {
				log.Logger(logCtx).Info(" - attach " + pattern + " (strip prefix " + prefix + ")")
			} else {
				log.Logger(logCtx).Info(" - attach " + pattern)
			}
			mu.Handle(pattern, handler)
		}
		r.patternsMutex.RUnlock()
	}
	return mu, nil
}

func (h *registrar) Patterns() (patterns []string) {
	for _, r := range h.routes {
		r.patternsMutex.RLock()
		for p, reg := range r.patternsCache {
			pattern, _, _ := reg.attach(r.uri, p)
			patterns = append(patterns, pattern)
		}
		r.patternsMutex.RUnlock()
	}
	return
}

func (h *registrar) DeregisterPattern(pattern string) {

	// TODO - GO THROUGH ROUTE - DEBOUNCE & TRIGGER HTTP SERVER RESTART?
	//	h.patternsMutex.Lock()
	//	defer h.patternsMutex.Unlock()
	//	delete(h.patternsCache, pattern)
}

func (h *registrar) Route(id string) Route {
	for _, r := range h.routes {
		if r.id == id {
			return r
		}
	}
	for _, d := range declaredRoutes {
		if d.id == id {
			sr := &subRoute{
				id:             id,
				uri:            d.uri,
				customResolver: d.customResolver,
				subPathSupport: d.subPathSupport,
				patternsCache:  map[string]*registeredHandler{},
				registrar:      h,
			}
			h.routes = append(h.routes, sr)
			return sr
		}
	}
	panic(fmt.Sprintf("Using a route id %s that was not previously declared", id))
}

type subRoute struct {
	id             string
	uri            string
	customResolver func(ctx context.Context) string
	description    string
	subPathSupport bool

	patternsCache map[string]*registeredHandler
	patternsMutex sync.RWMutex
	registrar     *registrar
}

// Handle registers a handler
func (s *subRoute) Handle(pattern string, handler http.Handler) {
	s.patternsMutex.Lock()
	s.patternsCache[pattern] = &registeredHandler{Handler: handler}
	s.patternsMutex.Unlock()
}

// HandleStripPrefix registers a handler wrapped in http.StripPrefix (full URI)
func (s *subRoute) HandleStripPrefix(pattern string, handler http.Handler) {
	s.patternsMutex.Lock()
	s.patternsCache[pattern] = &registeredHandler{Handler: handler, stripPrefix: true}
	s.patternsMutex.Unlock()
}

// URI returns resolved uri - TODO default should be read from config or XDS ?
func (s *subRoute) URI(ctx context.Context) string {
	if s.customResolver != nil {
		return s.customResolver(ctx)
	}
	return s.uri
}

type registeredHandler struct {
	http.Handler
	stripPrefix bool
}

func (r *registeredHandler) attach(resolvedRouteURI string, subPattern string) (pattern string, handler http.Handler, prefix string) {
	pattern = path.Join(resolvedRouteURI, subPattern)
	ha := r.Handler
	// Re-add trailing slash as Join may remove it
	if strings.HasSuffix(subPattern, "/") && !strings.HasSuffix(pattern, "/") {
		pattern += "/"
	}
	if r.stripPrefix {
		prefix = path.Join(resolvedRouteURI, subPattern) // NO trailing slash
		ha = http.StripPrefix(prefix, r.Handler)
	}
	// Wrap handler to inject resolvedRouteURI inside the context
	handler = http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		req := request.WithContext(context.WithValue(request.Context(), ctxResolvedRouteURI{}, resolvedRouteURI))
		ha.ServeHTTP(writer, req)
	})
	return
}
