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

package grpc

import (
	"errors"
	"math/rand"
	"strings"
	"sync"

	"google.golang.org/grpc/attributes"
	"google.golang.org/grpc/balancer"
	"google.golang.org/grpc/balancer/base"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client"

	_ "google.golang.org/grpc/balancer/grpclb"
)

var (
	configBuilders = map[string]*rrPickerBuilder{}
)

func registerBalancer(id string, options ...client.BalancerOption) {
	opt := &client.BalancerOptions{}
	for _, o := range options {
		o(opt)
	}
	configBuilders[id] = &rrPickerBuilder{balancerOptions: opt}
	builder := base.NewBalancerBuilder(id, configBuilders[id], base.Config{HealthCheck: false})
	balancer.Register(builder)
}

const BalancerRoundRobin = "cells-robin-"

type rrPickerBuilder struct {
	balancerOptions *client.BalancerOptions
}

func (b *rrPickerBuilder) Build(info base.PickerBuildInfo) balancer.Picker {
	if len(info.ReadySCs) == 0 {
		return base.NewErrPicker(balancer.ErrNoSubConnAvailable)
	}

	pcs := make(map[string]*rrPickerConns)
	for sc, sci := range info.ReadySCs {
		for _, s := range sci.Address.Attributes.Value("services").(comparableSlice) {
			v, ok := pcs[s]
			if !ok {
				v = &rrPickerConns{}
				pcs[s] = v
			}
			v.sc = append(v.sc, &rrPickerSubConn{SubConn: sc, SubConnInfo: sci})
		}
	}

	for _, pc := range pcs {
		pc.next = rand.Intn(len(pc.sc))
	}
	return &rrPicker{
		options: b.balancerOptions,
		pConns:  pcs,
	}
}

type rrPicker struct {
	options *client.BalancerOptions
	pConns  map[string]*rrPickerConns
}

type rrPickerConns struct {
	mu   sync.Mutex
	next int
	sc   []*rrPickerSubConn
}

type rrPickerSubConn struct {
	balancer.SubConn
	base.SubConnInfo
}

func (r *rrPickerSubConn) Address() string {
	return r.SubConnInfo.Address.Addr
}

func (r *rrPickerSubConn) Attributes() *attributes.Attributes {
	return r.SubConnInfo.Address.BalancerAttributes
}

func (p *rrPicker) Pick(i balancer.PickInfo) (balancer.PickResult, error) {
	var serviceName string
	if md, o := metadata.FromOutgoingContext(i.Ctx); o {
		serviceName = strings.Join(md.Get(common.CtxTargetServiceName), "")
	}
	if serviceName == "" {
		return balancer.PickResult{}, errors.New("cannot find targetName in context")
	}
	pc, ok := p.pConns[serviceName]
	if !ok {
		return balancer.PickResult{}, errors.New("service is not known by the registry")
	}

	var filters, priorities []client.BalancerTargetFilter
	if p.options != nil {
		filters = append(filters, p.options.Filters...)
		priorities = append(priorities, p.options.Priority...)
	}
	if val := i.Ctx.Value(ctxBalancerFilterKey{}); val != nil {
		filters = append(filters, val.(client.BalancerTargetFilter))
	}
	if len(filters) == 0 && len(priorities) == 0 {
		// No specific policies, use Round Robin
		pc.mu.Lock()
		sc := pc.sc[pc.next].SubConn
		pc.next = (pc.next + 1) % len(pc.sc)
		pc.mu.Unlock()

		return balancer.PickResult{SubConn: sc}, nil
	}

	picks := pc.sc
	if len(filters) > 0 {
		for _, f := range filters {
			picks = p.applyFilter(f, picks)
		}
		if len(picks) == 0 {
			return balancer.PickResult{}, errors.New("no service found matching the current filters")
		}
	}
	if len(picks) > 1 && len(priorities) > 0 {
		priorityPicks := append([]*rrPickerSubConn{}, picks...)
		for _, f := range priorities {
			priorityPicks = p.applyFilter(f, priorityPicks)
		}
		if len(priorityPicks) > 0 {
			// fmt.Println("Returning priority processes first", len(priorityPicks))
			sc := priorityPicks[rand.Intn(len(priorityPicks))]
			return balancer.PickResult{SubConn: sc.SubConn}, nil
		}
	}
	sc := picks[rand.Intn(len(picks))]
	return balancer.PickResult{SubConn: sc.SubConn}, nil

}

func (p *rrPicker) applyFilter(f client.BalancerTargetFilter, sc []*rrPickerSubConn) []*rrPickerSubConn {
	var out []*rrPickerSubConn
	for _, conn := range sc {
		if f(conn) {
			out = append(out, conn)
		}
	}
	return out
}
