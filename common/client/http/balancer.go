package http

import (
	"net/http/httputil"
	"strings"
)

type Balancer struct {
	ReadyProxies map[string]*ReverseProxy
}

type ReverseProxy struct {
	*httputil.ReverseProxy
	Endpoints []string
	Services  []string
}

func (b *Balancer) PickService(name string) *httputil.ReverseProxy {
	for _, proxy := range b.ReadyProxies {
		for _, service := range proxy.Services {
			if service == name {
				return proxy.ReverseProxy
			}
		}
	}
	return nil
}

func (b *Balancer) PickEndpoint(path string) *httputil.ReverseProxy {
	for _, proxy := range b.ReadyProxies {
		for _, endpoint := range proxy.Endpoints {
			if endpoint == "/" {
				continue
			}
			if strings.HasPrefix(path, endpoint) {
				return proxy.ReverseProxy
			}
		}
	}
	return nil
}
