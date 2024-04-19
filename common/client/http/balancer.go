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

package http

import (
	"fmt"
	"math/rand"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc/attributes"

	"github.com/pydio/cells/v4/common/client"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

type Balancer interface {
	Build(m registry.Registry) error
	PickService(name string) (*httputil.ReverseProxy, error)
	PickEndpoint(path string) (*httputil.ReverseProxy, error)
}

func NewBalancer(excludeId string) Balancer {
	var clusterConfig *client.ClusterConfig
	config.Get("cluster").Default(&client.ClusterConfig{}).Scan(&clusterConfig)
	clientConfig := clusterConfig.GetClientConfig("http")

	opts := &client.BalancerOptions{}
	for _, o := range clientConfig.LBOptions() {
		o(opts)
	}
	return &balancer{
		readyProxies: map[string]*reverseProxy{},
		options:      opts,
		excludeID:    excludeId,
	}
}

type balancer struct {
	readyProxies map[string]*reverseProxy
	options      *client.BalancerOptions
	excludeID    string
}

type reverseProxy struct {
	*httputil.ReverseProxy
	services  []registry.Item
	endpoints []registry.Item
}

type proxyBalancerTarget struct {
	proxy   *reverseProxy
	address string
}

func (p *proxyBalancerTarget) Address() string {
	return p.address
}

func (p *proxyBalancerTarget) Attributes() *attributes.Attributes {
	// TODO
	return &attributes.Attributes{}
	// return p.proxy.BalancerAttributes
}

func (b *balancer) Build(reg registry.Registry) error {
	usedAddr := map[string]struct{}{}

	srvs, err := reg.List(registry.WithType(pb.ItemType_SERVER))
	if err != nil {
		return err
	}
	for _, srv := range srvs {
		if b.excludeID != "" && srv.ID() == b.excludeID {
			continue
		}

		addrs := reg.ListAdjacentItems(
			registry.WithAdjacentSourceItems([]registry.Item{srv}),
			registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_ADDRESS)),
		)
		var services, endpoints []registry.Item
		var loaded bool

		for _, addr := range addrs {
			addr := addr.Name()
			usedAddr[addr] = struct{}{}
			proxy, ok := b.readyProxies[addr]
			if !ok {
				scheme := "http://"
				// TODO - do that in a better way
				if srv.Name() == "grpcs" {
					scheme = "https://"
				}
				u, err := url.Parse(scheme + strings.Replace(addr, "[::]", "", -1))
				if err != nil {
					return err
				}
				if !loaded {
					services = reg.ListAdjacentItems(
						registry.WithAdjacentSourceItems([]registry.Item{srv}),
						registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_SERVICE)),
					)
					endpoints = reg.ListAdjacentItems(
						registry.WithAdjacentSourceItems([]registry.Item{srv}),
						registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_ENDPOINT)),
					)
				}
				proxy = &reverseProxy{
					ReverseProxy: httputil.NewSingleHostReverseProxy(u),
					services:     services,
					endpoints:    endpoints,
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
		}
	}
	for addr, _ := range b.readyProxies {
		if _, used := usedAddr[addr]; !used {
			delete(b.readyProxies, addr)
		}
	}
	return nil
}

func (b *balancer) PickService(name string) (*httputil.ReverseProxy, error) {
	var targets []*proxyBalancerTarget
	for addr, proxy := range b.readyProxies {
		for _, svc := range proxy.services {
			if svc.Name() == name {
				//return proxy.ReverseProxy
				targets = append(targets, &proxyBalancerTarget{
					proxy:   proxy,
					address: addr,
				})

			}
		}
	}
	if len(targets) == 0 {
		return nil, fmt.Errorf("no proxy found for service %s", name)
	}
	if b.options != nil && len(b.options.Filters) > 0 {
		for _, f := range b.options.Filters {
			targets = b.applyFilter(f, targets)
		}
		if len(targets) == 0 {
			return nil, fmt.Errorf("no proxy found for service %s matching filters", name)
		}
	}
	if len(targets) > 1 && b.options != nil && len(b.options.Priority) > 0 {
		priorityTargets := append([]*proxyBalancerTarget{}, targets...)
		for _, f := range b.options.Priority {
			priorityTargets = b.applyFilter(f, priorityTargets)
		}
		if len(priorityTargets) > 0 {
			fmt.Println("Selecting targets from priority targets")
			return priorityTargets[rand.Intn(len(priorityTargets))].proxy.ReverseProxy, nil
		}
	}
	return targets[rand.Intn(len(targets))].proxy.ReverseProxy, nil

}

func (b *balancer) PickEndpoint(path string) (*httputil.ReverseProxy, error) {
	var targets []*proxyBalancerTarget
	for addr, proxy := range b.readyProxies {
		endpoints := proxy.endpoints
		for _, endpoint := range endpoints {
			if endpoint.Name() == "/" {
				continue
			}

			if strings.HasPrefix(path, endpoint.Name()) {
				targets = append(targets, &proxyBalancerTarget{
					proxy:   proxy,
					address: addr,
				})
			}
		}
	}
	if len(targets) == 0 {
		return nil, fmt.Errorf("no proxy found for endpoint %s", path)
	}
	if b.options != nil && len(b.options.Filters) > 0 {
		for _, f := range b.options.Filters {
			targets = b.applyFilter(f, targets)
		}
		if len(targets) == 0 {
			return nil, fmt.Errorf("no proxy found for endpoint %s matching filters", path)
		}
	}
	return targets[rand.Intn(len(targets))].proxy.ReverseProxy, nil
}

func (b *balancer) applyFilter(f client.BalancerTargetFilter, tg []*proxyBalancerTarget) []*proxyBalancerTarget {
	var out []*proxyBalancerTarget
	for _, conn := range tg {
		if f(conn) {
			out = append(out, conn)
		}
	}
	return out
}
