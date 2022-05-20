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

package manager

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/pydio/cells/v4/common/utils/configx"

	"golang.org/x/sync/errgroup"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/config"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

type Manager interface {
	Init(ctx context.Context) error
	ServeAll(...server.ServeOption)
	StopAll()
	SetServeOptions(...server.ServeOption)
	WatchServicesConfigs()
	WatchBroker(ctx context.Context, br broker.Broker) error
}

type manager struct {
	ns         string
	srcUrl     string
	reg        registry.Registry
	root       registry.Item
	rootIsFork bool

	serveOptions []server.ServeOption

	servers  map[string]server.Server
	services map[string]service.Service
}

func NewManager(reg registry.Registry, srcUrl string, namespace string) Manager {
	m := &manager{
		ns:       namespace,
		srcUrl:   srcUrl,
		reg:      reg,
		servers:  make(map[string]server.Server),
		services: make(map[string]service.Service),
	}
	// Detect a parent root
	var current, parent registry.Item
	if ii, er := reg.List(registry.WithType(pb.ItemType_NODE)); er == nil && len(ii) > 0 {
		for _, root := range ii {
			rPID := root.Metadata()["PID"]
			if rPID == strconv.Itoa(os.Getppid()) {
				parent = root
			} else if rPID == strconv.Itoa(os.Getpid()) {
				current = root
			}
		}
	}
	if current != nil {
		m.root = current
	} else {
		node := util.CreateNode()
		if er := reg.Register(node); er == nil {
			m.root = node
			if parent != nil {
				m.rootIsFork = true
				_, _ = reg.RegisterEdge(parent.ID(), m.root.ID(), "Fork", map[string]string{})
			}
		}
	}
	return m
}

func (m *manager) Init(ctx context.Context) error {

	srcReg, err := registry.OpenRegistry(ctx, m.srcUrl)
	if err != nil {
		return err
	}

	ctx = servercontext.WithRegistry(ctx, m.reg)
	ctx = servicecontext.WithRegistry(ctx, srcReg)
	runtime.Init(ctx, m.ns)

	services, err := srcReg.List(registry.WithType(pb.ItemType_SERVICE))
	if err != nil {
		return err
	}

	byScheme := map[string]server.Server{}

	for _, ss := range services {
		var s service.Service
		if !ss.As(&s) {
			continue
		}
		opts := s.Options()
		mustFork := opts.Fork && !runtime.IsFork()

		// Replace service context with target registry
		opts.Context = servicecontext.WithRegistry(opts.Context, m.reg)

		if !runtime.IsRequired(s.Name(), opts.Tags...) {
			continue
		}

		if mustFork && !opts.AutoStart {
			continue
		}

		scheme := s.ServerScheme()
		if sr, o := byScheme[scheme]; o {
			opts.Server = sr
		} else if srv, er := server.OpenServer(opts.Context, scheme); er == nil {
			byScheme[scheme] = srv
			opts.Server = srv
		} else {
			return er
		}

		if mustFork {
			continue // Do not register here
		}

		if er := m.reg.Register(s, registry.WithEdgeTo(m.root.ID(), "Node", map[string]string{})); er != nil {
			return er
		}

		m.services[s.ID()] = s

	}

	if m.root != nil {
		for _, sr := range byScheme {
			m.servers[sr.ID()] = sr // Keep a ref to the actual object
			_, _ = m.reg.RegisterEdge(m.root.ID(), sr.ID(), "Node", map[string]string{})
		}
	}

	return nil

}

func (m *manager) SetServeOptions(oo ...server.ServeOption) {
	m.serveOptions = oo
}

func (m *manager) ServeAll(oo ...server.ServeOption) {
	m.serveOptions = oo
	opt := &server.ServeOptions{}
	for _, o := range oo {
		o(opt)
	}
	eg := &errgroup.Group{}
	ss := m.serversWithStatus("stopped")
	for _, srv := range ss {
		func(srv server.Server) {
			eg.Go(func() error {
				return m.startServer(srv, oo...)
			})
		}(srv)
	}
	go func() {
		if err := eg.Wait(); err != nil && opt.ErrorCallback != nil {
			opt.ErrorCallback(err)
		}
	}()
}

func (m *manager) StopAll() {
	for _, srv := range m.serversWithStatus("ready") {
		if err := srv.Stop(registry.WithDeregisterFull()); err != nil {
			fmt.Println("Error stopping server ", err)
		}
	}
	//fmt.Println("Deregister Node")
	_ = m.reg.Deregister(m.root, registry.WithRegisterFailFast())
}

func (m *manager) startServer(srv server.Server, oo ...server.ServeOption) error {
	opts := append(oo)
	for _, svc := range m.services {
		if svc.Options().Server == srv {
			opts = append(opts, m.serviceServeOptions(svc)...)
		}
	}
	return srv.Serve(opts...)
}

func (m *manager) startService(svc service.Service) error {
	// Look up for corresponding server
	srv := svc.Options().Server
	serveOptions := append(m.serveOptions, m.serviceServeOptions(svc)...)

	if srv.Metadata()["status"] == "stopped" {
		fmt.Println("Starting server " + srv.ID() + " now")
		return srv.Serve(serveOptions...)
	}

	fmt.Println("Server is running " + srv.ID() + " - Dynamically re-attach service?")
	if srv.Type() == server.TypeGrpc {
		fmt.Println("GRPC needs a restart, collect already running services")
		for _, sv := range m.services {
			if sv.Options().Server == srv && sv.Metadata()["status"] == "ready" {
				fmt.Println("Will restart service " + sv.Name())
				serveOptions = append(serveOptions, m.serviceServeOptions(sv)...)
			}
		}
		if er := srv.Stop(); er != nil {
			return er
		}
		return srv.Serve(serveOptions...)
	} else {
		fmt.Println("Start service directly, just register A Before Stop")
		if er := svc.Start(); er != nil {
			return er
		}
		if er := svc.OnServe(); er != nil {
			return er
		}
		srv.RegisterBeforeStop(svc.Stop)
	}

	return nil
}

func (m *manager) serviceServeOptions(svc service.Service) []server.ServeOption {
	return []server.ServeOption{
		server.WithBeforeServe(svc.Start),
		server.WithAfterServe(svc.OnServe),
		server.WithBeforeStop(svc.Stop),
	}
}

func (m *manager) serversWithStatus(status string) (ss []server.Server) {
	for _, srv := range m.servers {
		if srv.Metadata()["status"] == status {
			ss = append(ss, srv)
		}
	}
	return
}

func (m *manager) WatchServicesConfigs() {
	ch, err := config.WatchMap(configx.WithPath("services"))
	if err != nil {
		return
	}
	for kv := range ch {
		ss, err := m.reg.List(registry.WithName(kv.Key))
		if err != nil || len(ss) == 0 {
			continue
		}
		var rs service.Service
		if ss[0].As(&rs) && rs.Options().AutoRestart {
			rs.Stop()
			m.startService(rs)
		}
	}
}

func (m *manager) WatchBroker(ctx context.Context, br broker.Broker) error {
	_, er := br.Subscribe(ctx, common.TopicRegistryCommand, func(message broker.Message) error {
		hh, _ := message.RawData()
		cmd := hh["command"]
		itemName := hh["itemName"]
		s, err := m.reg.Get(itemName, registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			if err == os.ErrNotExist {
				return nil
			}
			return err
		}

		var src service.Service
		var srv server.Server
		var rsrc registry.Service
		var rsrv registry.Server
		if s.As(&src) || s.As(&srv) {
			// In-memory object found
		} else if s.As(&rsrc) {
			if mem, ok := m.services[s.ID()]; ok {
				src = mem
			}
		} else if s.As(&rsrv) {
			if mem, ok := m.servers[s.ID()]; ok {
				srv = mem
			}
		}
		if src == nil && srv == nil {
			return nil
		}
		fmt.Println("FOUND REAL OBJECT HERE", src, srv)

		switch cmd {
		case "start":
			if src != nil {
				return m.startService(src)
			} else {
				return m.startServer(srv, m.serveOptions...)
			}
		case "restart":
			if src != nil {
				if er := src.Stop(); er == nil {
					return m.startService(src)
				} else {
					return er
				}
			} else {
				if er := srv.Stop(); er == nil {
					return m.startServer(srv, m.serveOptions...)
				} else {
					return er
				}
			}
		case "stop":
			if src != nil {
				return src.Stop()
			} else {
				return srv.Stop()
			}
		}
		return nil
	})
	if er != nil {
		fmt.Println("Manager cannot watch broker: ", er)
	}
	return er
}
