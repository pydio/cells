package http

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc/attributes"

	"github.com/pydio/cells/v4/common/client"
	"github.com/pydio/cells/v4/common/log"
)

type Balancer interface {
	Build(m map[string]*client.ServerAttributes) error
	PickService(name string) *httputil.ReverseProxy
	PickEndpoint(path string) *httputil.ReverseProxy
}

func NewBalancer() Balancer {
	return &balancer{readyProxies: map[string]*reverseProxy{}}
}

type balancer struct {
	readyProxies map[string]*reverseProxy
}

type reverseProxy struct {
	*httputil.ReverseProxy
	Endpoints          []string
	Services           []string
	BalancerAttributes *attributes.Attributes
}

func (b *balancer) Build(m map[string]*client.ServerAttributes) error {
	usedAddr := map[string]struct{}{}
	for _, mm := range m {
		for _, addr := range mm.Addresses {
			usedAddr[addr] = struct{}{}
			proxy, ok := b.readyProxies[addr]
			if !ok {
				scheme := "http://"
				// TODO - do that in a better way
				if mm.Name == "grpcs" {
					scheme = "https://"
				}
				u, err := url.Parse(scheme + strings.Replace(addr, "[::]", "", -1))
				if err != nil {
					return err
				}
				proxy = &reverseProxy{
					ReverseProxy: httputil.NewSingleHostReverseProxy(u),
				}
				proxy.ErrorHandler = func(writer http.ResponseWriter, request *http.Request, err error) {
					if err.Error() == "context canceled" {
						return
					}
					log.Logger(request.Context()).Error("Proxy Error :"+err.Error(), zap.Error(err))
					writer.WriteHeader(http.StatusBadGateway)
				}
				b.readyProxies[addr] = proxy
			}
			proxy.Endpoints = mm.Endpoints
			proxy.Services = mm.Services
			proxy.BalancerAttributes = mm.BalancerAttributes
		}
	}
	for addr, _ := range b.readyProxies {
		if _, used := usedAddr[addr]; !used {
			fmt.Println("Removing unused http proxy for address", addr)
			delete(b.readyProxies, addr)
		}
	}
	return nil
}

func (b *balancer) PickService(name string) *httputil.ReverseProxy {
	for _, proxy := range b.readyProxies {
		for _, service := range proxy.Services {
			if service == name {
				return proxy.ReverseProxy
			}
		}
	}
	return nil
}

func (b *balancer) PickEndpoint(path string) *httputil.ReverseProxy {
	for _, proxy := range b.readyProxies {
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
