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

		if r.Action() == "create" {

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
