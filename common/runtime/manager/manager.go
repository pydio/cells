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

	"golang.org/x/sync/errgroup"

	"github.com/pydio/cells/v4/common/config"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
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
	WatchServicesConfigs()
}

type manager struct {
	ns     string
	srvs   []server.Server
	srcUrl string
	reg    registry.Registry
}

func NewManager(reg registry.Registry, srcUrl string, namespace string) Manager {
	m := &manager{
		ns:     namespace,
		srcUrl: srcUrl,
		reg:    reg,
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
	)

	for _, ss := range services {
		var s service.Service
		if !ss.As(&s) {
			continue
		}
		if !runtime.IsRequired(s.Name(), s.Options().Tags...) {
			continue
		}
		opts := s.Options()

		// Now replace servicecontext with target registry
		opts.Context = servicecontext.WithRegistry(opts.Context, m.reg)

		if opts.Fork && !runtime.IsFork() {
			if !opts.AutoStart {
				continue
			}
			srvFork := fork.NewServer(opts.Context, opts.Name)
			m.srvs = append(m.srvs, srvFork)
			opts.Server = srvFork
			continue
		}

		// Call after checking Fork: do not register service definition in parent process
		if er := m.reg.Register(s); er != nil {
			return er
		}

		if opts.Server != nil {

			m.srvs = append(m.srvs, opts.Server)

		} else if opts.ServerProvider != nil {

			serv, er := opts.ServerProvider(ctx)
			if er != nil {
				return er
			}
			opts.Server = serv
			m.srvs = append(m.srvs, opts.Server)

		} else {
			if s.IsGRPC() {
				if srvGRPC == nil {
					srvGRPC = servergrpc.New(ctx)
					m.srvs = append(m.srvs, srvGRPC)
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

					m.srvs = append(m.srvs, srvHTTP)
				}
				opts.Server = srvHTTP
			}

			if s.IsGeneric() {
				if srvGeneric == nil {
					srvGeneric = generic.New(ctx)
					m.srvs = append(m.srvs, srvGeneric)
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

	return nil

}

func (m *manager) ServeAll(oo ...server.ServeOption) {
	opt := &server.ServeOptions{}
	for _, o := range oo {
		o(opt)
	}
	eg := &errgroup.Group{}
	for _, srv := range m.srvs {
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
	for _, srv := range m.srvs {
		fmt.Println("Stopping server", srv.Name())
		if err := srv.Stop(); err != nil {
			fmt.Println("Error stopping server ", err)
		}
	}
}

func (m *manager) WatchServicesConfigs() {
	ch, err := config.WatchMap("services")
	if err != nil {
		return
	}
	for kv := range ch {
		s, err := m.reg.Get(kv.Key)
		if err != nil {
			continue
		}
		var rs service.Service
		if s.As(&rs) && rs.Options().AutoRestart {
			rs.Stop()

			rs.Start()
		}
	}
}
