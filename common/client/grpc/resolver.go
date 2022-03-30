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
	"regexp"
	"sort"

	"github.com/pydio/cells/v4/common/client"

	"google.golang.org/grpc/resolver"

	"google.golang.org/grpc/attributes"

	"github.com/pydio/cells/v4/common/registry"
)

var (
	errMissingAddr  = errors.New("cells resolver: missing address")
	errAddrMisMatch = errors.New("cells resolver: invalid uri")
	regex, _        = regexp.Compile("^([A-z0-9.]*?)(:[0-9]{1,5})?\\/([A-z_]*)$")
)

type cellsBuilder struct {
	reg registry.Registry
}

type cellsResolver struct {
	address              string
	cc                   resolver.ClientConn
	name                 string
	disableServiceConfig bool
}

func NewBuilder(reg registry.Registry) resolver.Builder {
	return &cellsBuilder{reg: reg}
}

func (b *cellsBuilder) Build(target resolver.Target, cc resolver.ClientConn, opts resolver.BuildOptions) (resolver.Resolver, error) {
	// host, port, name, err := parseTarget(fmt.Sprintf("%s/%s", target.Authority, target.Endpoint))
	_, _, name, err := parseTarget(fmt.Sprintf("%s/%s", target.Authority, target.Endpoint))
	if err != nil {
		return nil, err
	}

	cr := &cellsResolver{
		name:                 name,
		cc:                   cc,
		disableServiceConfig: opts.DisableServiceConfig,
	}

	rc, err := client.NewResolverCallback(b.reg)
	if err != nil {
		return nil, err
	}

	rc.Add(func(m map[string]*client.ServerAttributes) error {
		var addresses []resolver.Address

		for _, mm := range m {
			if mm.Name != "grpc" {
				continue
			}
			for _, addr := range mm.Addresses {
				addresses = append(addresses, resolver.Address{
					Addr:       addr,
					Attributes: attributes.New("services", comparableSlice(mm.Services)),
				})
			}
		}

		if len(addresses) == 0 {
			// dont' bother sending yet
			return nil
		}

		if err := cr.cc.UpdateState(resolver.State{
			Addresses:     addresses,
			ServiceConfig: cr.cc.ParseServiceConfig(`{"loadBalancingPolicy": "lb"}`),
		}); err != nil {
			return err
		}

		return nil
	})

	return cr, nil
}

func (b *cellsBuilder) Scheme() string {
	return "cells"
}

func (cr *cellsResolver) ResolveNow(opt resolver.ResolveNowOptions) {
}

func (cr *cellsResolver) Close() {
}

func parseTarget(target string) (host, port, name string, err error) {
	if target == "" {
		return "", "", "", errMissingAddr
	}

	if !regex.MatchString(target) {
		return "", "", "", errAddrMisMatch
	}

	groups := regex.FindStringSubmatch(target)
	host = groups[1]
	port = groups[2]
	name = groups[3]

	return host, port, name, nil
}

type comparableSlice []string

func (c comparableSlice) Equal(o interface{}) bool {
	if &c == o {
		return true
	}
	ss, ok := o.(comparableSlice)
	if !ok {
		return false
	}
	if len(ss) != len(c) {
		return false
	}
	sort.Strings(c)
	sort.Strings(ss)
	for i, v := range c {
		if ss[i] != v {
			return false
		}
	}
	return true
}
