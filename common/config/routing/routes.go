/*
 * Copyright (c) 2019-2024. Abstrium SAS <team (at) pydio.com>
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

package routing

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"slices"
	"strings"
	"sync"

	"github.com/pydio/cells/v5/common/telemetry/log"
)

var (
	declaredRoutes []*subRoute
)

type ctxResolvedRouteURI struct{}

type Rewriter func(req *http.Request, currentRegistrar RouteRegistrar)

// RegisterRoute registers a generic route by a unique ID, which URI will be resolved at runtime
func RegisterRoute(id, description, defaultURI string, opts ...RouteOption) {
	opt := &RouteOptions{}
	for _, o := range opts {
		o(opt)
	}
	declaredRoutes = append(declaredRoutes, &subRoute{
		id:             id,
		description:    description,
		uri:            defaultURI,
		subPathSupport: !opt.NoSubPath,
		websocket:      opt.WebSocket,
	})
}

// ListRoutes returns all declared routes
func ListRoutes() []Route {
	var rr []Route
	for _, sr := range declaredRoutes {
		rr = append(rr, sr)
	}
	return rr
}

// RouteById finds a route by its ID
func RouteById(id string) (Route, bool) {
	for _, sr := range declaredRoutes {
		if sr.id == id {
			return sr, true
		}
	}
	return nil, false
}

// RouteRegistrar is used to declare routes and their patterns
type RouteRegistrar interface {
	Route(id string) Route
	DeregisterRoute(id string)
	RegisterRewrite(id string, rewriter Rewriter)
	DeregisterRewrite(id string)
	Patterns(routeIDs ...string) []string
	ApplyRewrites(req *http.Request)
	CanRewriteAndCatchAll(req *http.Request) (b bool)
	IteratePatterns(context.Context, func(pattern string, handler http.Handler))
}

// Route can be seen as a Router for a given route ID
type Route interface {
	GetID() string
	GetDescription() string
	GetURI() string
	IsWebSocket() bool
	SupportSubPath() bool
	Endpoint(pattern string) string
	// Handle registers a handler
	Handle(pattern string, handler http.Handler, opts ...HandleOption)
	// Deregister a specific pattern from the current route
	Deregister(pattern string)
}

// RouteOptions are used to pass options to the route declaration
type RouteOptions struct {
	DefaultURI string
	NoSubPath  bool
	WebSocket  bool
}

// RouteOption is the functional access to RouteOptions
type RouteOption func(o *RouteOptions)

// WithWebSocket defines this route as supporting HTTP1 only
func WithWebSocket() RouteOption {
	return func(o *RouteOptions) {
		o.WebSocket = true
	}
}

// WithoutSubPathSupport declares this route as not being able to be served on a sub-folder URI
func WithoutSubPathSupport() RouteOption {
	return func(o *RouteOptions) {
		o.NoSubPath = true
	}
}

// ResolvedURIFromContext reads resolved URI from context
func ResolvedURIFromContext(ctx context.Context) string {
	return ctx.Value(ctxResolvedRouteURI{}).(string)
}

// HandleOptions can be used to pass options to the Handle method
type HandleOptions struct {
	StripPrefix         bool
	EnsureTrailingSlash bool
	RewriteCatchAll     bool
}

// HandleOption provides functional access for HandleOptions
type HandleOption func(o *HandleOptions)

// WithStripPrefix will wrap the handler **at runtime** with a http.StripPrefix middleware and the resolved URI
func WithStripPrefix() HandleOption {
	return func(o *HandleOptions) {
		o.StripPrefix = true
	}
}

// WithEnsureTrailing will double registration to pattern and pattern+"/" to make sure
func WithEnsureTrailing() HandleOption {
	return func(o *HandleOptions) {
		o.EnsureTrailingSlash = true
	}
}

// WithRewriteCatchAll points this handler as catch-all - If request was not handled before, it can be rewritten
// to this handler resolved pattern and applied
func WithRewriteCatchAll() HandleOption {
	return func(o *HandleOptions) {
		o.RewriteCatchAll = true
	}
}

type RequestRewriter func(r *http.Request)

// NewRouteRegistrar creates a RouteRegistrar interface implementation
func NewRouteRegistrar() RouteRegistrar {
	return &registrar{}
}

type registrar struct {
	routes   []*subRoute
	rewrites map[string]Rewriter
	rewLock  sync.RWMutex
}

// IteratePatterns performs a callback on all actual patterns and their corresponding handler
func (h *registrar) IteratePatterns(ctx context.Context, it func(pattern string, handler http.Handler)) {
	for _, r := range h.routes {
		log.Logger(ctx).Info("ROUTE " + r.id)
		r.patternsMutex.RLock()
		for routePattern, registered := range r.patternsCache {
			pattern, handler, prefix := registered.attach(r, routePattern)
			if prefix != "" {
				log.Logger(ctx).Info(" - attach " + pattern + " (strip prefix " + prefix + ")")
			} else {
				log.Logger(ctx).Info(" - attach " + pattern)
			}
			it(pattern, handler)
		}
		r.patternsMutex.RUnlock()
	}
}

// Patterns lists all registered patterns (or restricted to some given routes)
func (h *registrar) Patterns(routeIDs ...string) (patterns []string) {

	for _, r := range h.routes {
		if len(routeIDs) > 0 && !slices.Contains(routeIDs, r.id) {
			continue
		}
		r.patternsMutex.RLock()
		for p, reg := range r.patternsCache {
			pattern, _, _ := reg.attach(r, p)
			patterns = append(patterns, pattern)
		}
		r.patternsMutex.RUnlock()
	}
	return
}

func (h *registrar) CanRewriteAndCatchAll(req *http.Request) (b bool) {
	var rewriteTo string
	for _, r := range h.routes {
		r.patternsMutex.RLock()
		for p, reg := range r.patternsCache {
			if reg.catchAll {
				b = true
				rewriteTo, _, _ = reg.attach(r, p)
				break
			}
		}
		r.patternsMutex.RUnlock()
	}
	if b {
		req.URL.Path = rewriteTo
		req.URL.RawPath = rewriteTo
		req.RequestURI = req.URL.RequestURI()
	}
	return
}

// Route gets or creates a route by ID
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

// DeregisterRoute fully removes a Route
func (h *registrar) DeregisterRoute(id string) {
	var rr []*subRoute
	for _, v := range h.routes {
		if v.id != id {
			rr = append(rr, v)
		}
	}
	h.routes = rr
}

func (h *registrar) RegisterRewrite(id string, rw Rewriter) {
	h.rewLock.Lock()
	defer h.rewLock.Unlock()
	if h.rewrites == nil {
		h.rewrites = make(map[string]Rewriter)
	}
	h.rewrites[id] = rw
}

func (h *registrar) DeregisterRewrite(id string) {
	h.rewLock.Lock()
	defer h.rewLock.Unlock()
	delete(h.rewrites, id)
}

func (h *registrar) ApplyRewrites(req *http.Request) {
	h.rewLock.RLock()
	defer h.rewLock.RUnlock()
	for _, rw := range h.rewrites {
		rw(req, h)
	}
}

type subRoute struct {
	id             string
	uri            string
	description    string
	subPathSupport bool
	websocket      bool

	patternsCache map[string]*registeredHandler
	patternsMutex sync.RWMutex
	registrar     *registrar
}

func (s *subRoute) GetID() string {
	return s.id
}

func (s *subRoute) GetDescription() string {
	return s.description
}

func (s *subRoute) GetURI() string {
	return s.uri
}

func (s *subRoute) SupportSubPath() bool {
	return s.subPathSupport
}

func (s *subRoute) IsWebSocket() bool {
	return s.websocket
}

func (s *subRoute) Endpoint(pattern string) string {
	fullPattern := path.Join(s.uri, pattern)
	// Re-add trailing slash as Join may remove it
	if strings.HasSuffix(pattern, "/") && !strings.HasSuffix(fullPattern, "/") {
		fullPattern += "/"
	}
	return fullPattern
}

// Handle registers a handler
func (s *subRoute) Handle(pattern string, handler http.Handler, opts ...HandleOption) {
	opt := &HandleOptions{}
	for _, o := range opts {
		o(opt)
	}
	s.patternsMutex.Lock()
	defer s.patternsMutex.Unlock()
	rh := &registeredHandler{
		Handler:     handler,
		stripPrefix: opt.StripPrefix,
		catchAll:    opt.RewriteCatchAll,
	}
	s.patternsCache[pattern] = rh
	if opt.EnsureTrailingSlash && !strings.HasSuffix(pattern, "/") {
		s.patternsCache[pattern+"/"] = rh
	}
}

// Deregister fully removes a given pattern from a route
func (s *subRoute) Deregister(pattern string) {

	s.patternsMutex.Lock()
	defer s.patternsMutex.Unlock()
	delete(s.patternsCache, pattern)
	if _, ok := s.patternsCache[pattern+"/"]; ok {
		delete(s.patternsCache, pattern+"/")
	}

}

type registeredHandler struct {
	http.Handler
	stripPrefix bool
	catchAll    bool
}

func (r *registeredHandler) attach(route *subRoute, subPattern string) (pattern string, handler http.Handler, prefix string) {
	pattern = route.Endpoint(subPattern)
	ha := r.Handler
	if r.stripPrefix {
		prefix = strings.TrimSuffix(pattern, "/") // NO trailing slash
		ha = StripPrefixKeepSlash(prefix, r.Handler)
	}
	// Wrap handler to inject resolvedRouteURI inside the context
	handler = http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		// Todo : read resolved from request header
		req := request.WithContext(context.WithValue(request.Context(), ctxResolvedRouteURI{}, route.uri))
		ha.ServeHTTP(writer, req)
	})
	return
}

// StripPrefixKeepSlash returns a handler that serves HTTP requests by removing the
// given prefix from the request URL's Path (and RawPath if set) and invoking
// the handler h. StripPrefixKeepSlash handles a request for a path that doesn't begin
// with prefix by replying with an HTTP 404 not found error. The prefix must
// match exactly: if the prefix in the request contains escaped characters
// the reply is also an HTTP 404 not found error.
//
// It differs from http.StripPrefix by keeping a "/" if resulting path is ""
func StripPrefixKeepSlash(prefix string, h http.Handler) http.Handler {
	if prefix == "" {
		return h
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p := strings.TrimPrefix(r.URL.Path, prefix)
		if p == "" {
			p = "/"
		}
		rp := strings.TrimPrefix(r.URL.RawPath, prefix)
		if rp == "" {
			rp = "/"
		}
		if len(p) < len(r.URL.Path) && (r.URL.RawPath == "" || len(rp) < len(r.URL.RawPath)) {
			r2 := new(http.Request)
			*r2 = *r
			r2.URL = new(url.URL)
			*r2.URL = *r.URL
			r2.URL.Path = p
			r2.URL.RawPath = rp
			h.ServeHTTP(w, r2)
		} else {
			http.NotFound(w, r)
		}
	})
}
