package grpc

import (
	"errors"
	"fmt"
	"regexp"
	"sort"
	"sync"
	"time"

	"google.golang.org/grpc/attributes"
	"google.golang.org/grpc/resolver"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

const (
	defaultPort = "8001"
)

var (
	errMissingAddr = errors.New("cells resolver: missing address")

	errAddrMisMatch = errors.New("cells resolver: invalid uri")

	regex, _ = regexp.Compile("^([A-z0-9.]*?)(:[0-9]{1,5})?\\/([A-z_]*)$")
)

type cellsBuilder struct {
	reg registry.Registry
}

type cellsResolver struct {
	reg                  registry.Registry
	address              string
	cc                   resolver.ClientConn
	name                 string
	items                []registry.Item
	ml                   *sync.RWMutex
	updatedState         chan struct{}
	updatedStateTimer    *time.Timer
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
		reg:  b.reg,
		name: name,
		cc:   cc,
		// m:                    map[string]comparableSlice{},
		ml:                   &sync.RWMutex{},
		disableServiceConfig: opts.DisableServiceConfig,
		updatedStateTimer:    time.NewTimer(50 * time.Millisecond),
	}

	go cr.updateState()
	go cr.watch()

	items, err := b.reg.List()
	if err != nil {
		return nil, err
	}

	cr.ml.Lock()
	cr.items = items
	cr.ml.Unlock()

	cr.sendState()

	return cr, nil
}

func (cr *cellsResolver) watch() {
	w, err := cr.reg.Watch(registry.WithAction(pb.ActionType_FULL_LIST))
	if err != nil {
		return
	}

	for {
		r, err := w.Next()
		if err != nil {
			return
		}

		cr.items = r.Items()
		cr.updatedStateTimer.Reset(50 * time.Millisecond)
	}
}

func (cr *cellsResolver) updateState() {
	for {
		select {
		case <-cr.updatedStateTimer.C:
			cr.sendState()
		}
	}
}

type serverAttributes struct {
	addresses []string
	services  []string
}

func (cr *cellsResolver) sendState() {
	var addresses []resolver.Address
	var m = make(map[string]*serverAttributes)

	cr.ml.RLock()
	for _, v := range cr.items {
		var srv registry.Node
		if v.As(&srv) {
			if srv.Name() != "grpc" {
				continue
			}

			m[srv.ID()] = &serverAttributes{
				addresses: srv.Address(),
			}
		}
	}

	for _, v := range cr.items {
		var svc registry.Service
		if v.As(&svc) {
			if !svc.IsGRPC() {
				continue
			}

			for _, node := range svc.Nodes() {
				address, ok := m[node.ID()]
				if ok {
					address.services = append(address.services, svc.Name())
				}
			}
		}
	}
	cr.ml.RUnlock()

	for _, mm := range m {
		for _, addr := range mm.addresses {
			addresses = append(addresses, resolver.Address{
				Addr:       addr,
				Attributes: attributes.New("services", comparableSlice(mm.services)),
			})
		}
	}

	if len(addresses) == 0 {
		// dont' bother sending yet
		return
	}

	if err := cr.cc.UpdateState(resolver.State{
		Addresses:     addresses,
		ServiceConfig: cr.cc.ParseServiceConfig(`{"loadBalancingPolicy": "lb"}`),
	}); err != nil {
		fmt.Println("And the error is ? ", err)
	}
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
