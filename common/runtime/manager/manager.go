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

	"golang.org/x/sync/errgroup"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/config"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/server/fork"
	"github.com/pydio/cells/v4/common/server/generic"
	servergrpc "github.com/pydio/cells/v4/common/server/grpc"
	"github.com/pydio/cells/v4/common/server/http"
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

	var (
		srvGRPC    server.Server
		srvHTTP    server.Server
		srvGeneric server.Server
		srvs       []server.Server
	)

	for _, ss := range services {
		var s service.Service
		if !ss.As(&s) {
			continue
		}
		opts := s.Options()
		mustFork := opts.Fork && !runtime.IsFork()

		if !runtime.IsRequired(s.Name(), opts.Tags...) {
			continue
		}

		// Now replace servicecontext with target registry
		opts.Context = servicecontext.WithRegistry(opts.Context, m.reg)

		if mustFork {
			if !opts.AutoStart {
				continue
			}
			srvFork := fork.NewServer(opts.Context, opts.Name)
			srvs = append(srvs, srvFork)
			opts.Server = srvFork
			continue
		}

		if er := m.reg.Register(s, registry.WithEdgeTo(m.root.ID(), "Node", map[string]string{})); er != nil {
			return er
		} else {
			m.services[s.ID()] = s
		}

		if opts.Server != nil {

			srvs = append(srvs, opts.Server)

		} else if opts.ServerProvider != nil {

			serv, er := opts.ServerProvider(ctx)
			if er != nil {
				return er
			}
			opts.Server = serv
			srvs = append(srvs, opts.Server)

		} else {
			if s.IsGRPC() {
				if srvGRPC == nil {
					srvGRPC = servergrpc.New(ctx)
					srvs = append(srvs, srvGRPC)
				}

				opts.Server = srvGRPC
			}

			if s.IsREST() {
				if srvHTTP == nil {
					if runtime.HttpServerType() == runtime.HttpServerCaddy {
						if s, e := caddy.New(opts.Context, ""); e != nil {
							return e
						} else {
							srvHTTP = s
						}
					} else {
						srvHTTP = http.New(ctx)
					}

					srvs = append(srvs, srvHTTP)
				}
				opts.Server = srvHTTP
			}

			if s.IsGeneric() {
				if srvGeneric == nil {
					srvGeneric = generic.New(ctx)
					srvs = append(srvs, srvGeneric)
				}
				opts.Server = srvGeneric

			}
		}

		opts.Server.BeforeServe(s.Start)
		opts.Server.AfterServe(func() error {
			// Register service again to update status information
			return m.reg.Register(s, registry.WithEdgeTo(opts.Server.ID(), "Server", map[string]string{}))
		})
		opts.Server.BeforeStop(s.Stop)

	}

	if m.root != nil {
		for _, sr := range srvs {
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
	ss := m.ListServersWithStatus("stopped")
	for _, srv := range ss {
		func(srv server.Server) {
			eg.Go(func() error {
				return srv.Serve(oo...)
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
	for _, srv := range m.ListServersWithStatus("ready") {
		if err := srv.Stop(); err != nil {
			fmt.Println("Error stopping server ", err)
		}
	}
	if m.rootIsFork {
		fmt.Println("Deregistering fork Node")
		_ = m.reg.Deregister(m.root)
	}
}

func (m *manager) ListServersWithStatus(status string) (ss []server.Server) {
	ii := m.reg.ListAdjacentItems(m.root, registry.WithType(pb.ItemType_SERVER), registry.WithMeta("status", status))
	for _, i := range ii {
		var srv server.Server
		var rs registry.Server
		if i.As(&srv) {
			// Make sure that this server is managed by this manager
			if _, ok := m.servers[srv.ID()]; ok {
				ss = append(ss, srv)
			}
		} else if i.As(&rs) {
			// Make sure that this server is managed by this manager
			// and replace registry.Item with actual instance
			if sr, ok := m.servers[rs.ID()]; ok {
				ss = append(ss, sr)
			}
		}
	}
	return
}

func (m *manager) WatchServicesConfigs() {
	ch, err := config.WatchMap("services")
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

			rs.Start()
		}
	}
}

func (m *manager) WatchBroker(ctx context.Context, br broker.Broker) error {
	_, er := br.Subscribe(ctx, common.TopicRegistryCommand, func(message broker.Message) error {
		hh, _ := message.RawData()
		cmd := hh["command"]
		itemName := hh["itemName"]
		s, err := m.reg.Get(itemName)
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
				return src.Start()
			} else {
				return srv.Serve(m.serveOptions...)
			}
		case "restart":
			if src != nil {
				if er := src.Stop(); er == nil {
					return src.Start()
				} else {
					return er
				}
			} else {
				if er := srv.Stop(); er == nil {
					return srv.Serve(m.serveOptions...)
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
