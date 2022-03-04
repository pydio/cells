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

package registrymux

import (
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/server"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"regexp"
	"strings"
)

type Middleware struct {
	r registry.Registry
	s server.HttpMux
}

func NewMiddleware(r registry.Registry, s server.HttpMux) http.Handler {
	return &Middleware{
		r: r,
		s: s,
	}
}

func (m Middleware) watch() error {
	w, err := m.r.Watch(registry.WithType(pb.ItemType_NODE))
	if err != nil {
		return err
	}

	defer w.Stop()

	for {
		r, err := w.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}

		if r.Action() == pb.ActionType_CREATE {

		}
	}

	return nil
}

// ServeHTTP.
func (m Middleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// try to find it in the current mux
	_, pattern := m.s.Handler(r)
	if len(pattern) > 0 && (pattern != "/" || r.URL.Path == "/") {
		m.s.ServeHTTP(w, r)
		return
	}

	// Couldn't find it in the mux, we go through the registered endpoints
	nodes, err := m.r.List(registry.WithType(pb.ItemType_NODE))
	if err != nil {
		return
	}

	for _, n := range nodes {
		var node registry.Node
		if !n.As(&node) {
			// fmt.Println("node is not a server ", n.Name())
			continue
		}

		for _, endpoint := range node.Endpoints() {
			ok, err := regexp.Match(endpoint, []byte(r.URL.Path))
			if err != nil {
				return
			}

			if ok {
				// TODO v4 - proxy should be set once when watching the node
				u, err := url.Parse("http://" + strings.Replace(node.Address()[0], "[::]", "", -1))
				if err != nil {
					return
				}
				proxy := httputil.NewSingleHostReverseProxy(u)
				proxy.ServeHTTP(w, r)
				return
			}
		}
	}
}
