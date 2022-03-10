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
	"fmt"
	"math/rand"
	"strings"
	"sync"

	"github.com/pydio/cells/v4/common/service/context/ckeys"

	"google.golang.org/grpc/balancer"
	"google.golang.org/grpc/balancer/base"
	"google.golang.org/grpc/metadata"
)

const name = "lb"

// newBuilder creates a new roundrobin balancer builder.
func newBuilder() balancer.Builder {
	return base.NewBalancerBuilder(name, &rrPickerBuilder{}, base.Config{HealthCheck: false})
}

func init() {
	balancer.Register(newBuilder())
}

type rrPickerBuilder struct{}

func (*rrPickerBuilder) Build(info base.PickerBuildInfo) balancer.Picker {
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

			v.subConns = append(v.subConns, sc)
			v.subConnsInfos = append(v.subConnsInfos, sci)
		}
	}

	for _, sc := range pcs {
		sc.next = rand.Intn(len(sc.subConns))
	}
	return &rrPicker{
		pConns: pcs,
	}
}

type rrPicker struct {
	pConns map[string]*rrPickerConns
}

type rrPickerConns struct {
	subConns      []balancer.SubConn
	subConnsInfos []base.SubConnInfo
	mu            sync.Mutex
	next          int
}

func (p *rrPicker) Pick(i balancer.PickInfo) (balancer.PickResult, error) {
	var serviceName string
	if md, o := metadata.FromOutgoingContext(i.Ctx); o {
		serviceName = strings.Join(md.Get(ckeys.TargetServiceName), "")
	}
	if serviceName == "" {
		return balancer.PickResult{}, fmt.Errorf("cannot find targetName in context")
	}
	pc, ok := p.pConns[serviceName]
	if !ok {
		return balancer.PickResult{}, errors.New("service is not known by the registry")
	}
	if val := i.Ctx.Value(ctxSubconnSelectorKey{}); val != nil {
		selector := val.(subConnInfoFilter)
		fmt.Println("Found a subConnInfo selector in context!", selector)
	}
	pc.mu.Lock()
	sc := pc.subConns[pc.next]
	pc.next = (pc.next + 1) % len(pc.subConns)
	pc.mu.Unlock()

	return balancer.PickResult{SubConn: sc}, nil
}
