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
	"context"
	"fmt"
	"math/rand"
	"net/url"
	"slices"
	"strings"

	"google.golang.org/grpc/attributes"

	"github.com/pydio/cells/v5/common/client"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
)

type Balancer interface {
	Build(m registry.Registry) error
	PickService(name string) (*url.URL, error)
	PickEndpoint(path string) (*url.URL, error)
	ListEndpointTargets(path string, reverse ...bool) ([]*url.URL, error)
}

func NewBalancer(ctx context.Context, excludeId string) Balancer {
	// TODO - lazy loading
	//var clusterConfig *client.ClusterConfig
	//config.Get(ctx, "cluster").Default(&client.ClusterConfig{}).Scan(&clusterConfig)
	//clientConfig := clusterConfig.GetClientConfig("http")

	opts := &client.BalancerOptions{}
	//for _, o := range clientConfig.LBOptions() {
	//	o(opts)
	//}

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
	*url.URL
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

		for _, item := range addrs {
			addr := item.Metadata()[registry.MetaDescriptionKey]
			usedAddr[addr] = struct{}{}
			scheme := "http://"
			srvScheme := srv.Metadata()[registry.MetaScheme]
			if slices.Contains(strings.Split(srvScheme, "+"), "tls") {
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
				loaded = true
			}
			proxy := &reverseProxy{
				URL:       u,
				services:  services,
				endpoints: endpoints,
			}
			b.readyProxies[addr] = proxy
		}
	}
	for addr, _ := range b.readyProxies {
		if _, used := usedAddr[addr]; !used {
			delete(b.readyProxies, addr)
		}
	}
	return nil
}

func (b *balancer) PickService(name string) (*url.URL, error) {
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
			return priorityTargets[rand.Intn(len(priorityTargets))].proxy.URL, nil
		}
	}

	return targets[rand.Intn(len(targets))].proxy.URL, nil
}

// ListEndpointTargets finds all corresponding upstream for a given path
func (b *balancer) ListEndpointTargets(path string, reverse ...bool) ([]*url.URL, error) {
	resolveReverse := len(reverse) > 0 && reverse[0]
	uniques := map[string]*proxyBalancerTarget{}
	for addr, proxy := range b.readyProxies {
		endpoints := proxy.endpoints
		for _, endpoint := range endpoints {
			include := false
			if resolveReverse {
				if path == "/" {
					include = endpoint.Name() == "/"
				} else {
					include = strings.HasPrefix(endpoint.Name(), path)
				}
			} else {
				include = endpoint.Name() != "/" && strings.HasPrefix(path, endpoint.Name())
			}
			if include {
				uniques[addr] = &proxyBalancerTarget{
					proxy:   proxy,
					address: addr,
				}
			}
		}
	}

	if len(uniques) == 0 {
		return nil, fmt.Errorf("no proxy found for endpoint %s", path)
	}

	var targets []*proxyBalancerTarget
	for _, t := range uniques {
		targets = append(targets, t)
	}

	if b.options != nil && len(b.options.Filters) > 0 {
		for _, f := range b.options.Filters {
			targets = b.applyFilter(f, targets)
		}
		if len(targets) == 0 {
			return nil, fmt.Errorf("no proxy found for endpoint %s matching filters", path)
		}
	}

	var output []*url.URL
	for _, t := range targets {
		output = append(output, t.proxy.URL)
	}

	return output, nil
}

// PickEndpoint lists all possible targets and returns a random one
func (b *balancer) PickEndpoint(path string) (*url.URL, error) {
	targets, er := b.ListEndpointTargets(path)
	if er != nil {
		return nil, er
	}

	return targets[rand.Intn(len(targets))], nil
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
