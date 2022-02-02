package registry

import (
	"fmt"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"net/http/httputil"
	"net/url"
	"sync"
)

type Balancer struct {

	m map[string]*[]Backend
	sync.RWMutex
}

type Backend struct {
	u *url.URL
	Alive bool
	mux sync.RWMutex
	ReverseProxy *httputil.ReverseProxy
}

func NewBalancer(r Registry) {
	b := &Balancer{}

	nodes, _ := r.List(WithType(pb.ItemType_NODE))
	for _, n := range nodes {
		var node Node
		n.As(&node)

		for _, endpoint := range node.Endpoints() {
			fmt.Println(endpoint)
		}
	}

	go b.watch(r)
}

func (b *Balancer) watch(r Registry) {
	_, err := r.Watch(WithType(pb.ItemType_NODE))
	if err != nil {
		return
	}
}