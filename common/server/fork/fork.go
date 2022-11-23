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

package fork

import (
	"context"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"net/url"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/utils/fork"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func init() {
	server.DefaultURLMux().Register("fork", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	fStart := u.Query().Get("start")
	return NewServer(ctx, fStart), nil
}

type Server struct {
	id   string
	name string
	meta map[string]string

	ctx     context.Context
	process *fork.Process

	s *ForkServer
}

func NewServer(ctx context.Context, forkStart string) server.Server {
	meta := server.InitPeerMeta()
	meta[runtime.NodeMetaForkStartTag] = "s:^" + forkStart + "$"
	return server.NewServer(ctx, &Server{
		id:   "fork-" + uuid.New(),
		name: "fork",
		meta: meta,
		ctx:  ctx,
		s:    &ForkServer{name: forkStart},
	})
}

func (s *Server) RawServe(*server.ServeOptions) (ii []registry.Item, e error) {

	var opts []fork.Option
	if config.Get("services", s.s.name, "debugFork").Bool() {
		opts = append(opts, fork.WithDebug())
	}
	if len(config.DefaultBindOverrideToFlags()) > 0 {
		opts = append(opts, fork.WithCustomFlags(config.DefaultBindOverrideToFlags()...))
	}
	opts = append(opts, fork.WithRetries(3))
	s.process = fork.NewProcess(s.ctx, []string{s.s.name}, opts...)

	go func() {
		e = s.process.StartAndWait()

		// TODO - move node registration from manager in here ?
		if pid, ok := s.process.GetPID(); ok {
			defer func() {
				reg := servicecontext.GetRegistry(s.ctx)

				processes, _ := reg.List(
					registry.WithType(pb.ItemType_NODE),
					registry.WithFilter(func(item registry.Item) bool {
						if item.Metadata()[runtime.NodeMetaPID] == pid {
							return true
						}
						return false
					}),
				)

				if len(processes) == 0 {
					return
				}

				// Get process for command
				var process registry.Node
				if !processes[0].As(&process) {
					return
				}

				var servers, services []string

				// Clearing all items belonging to process
				edges, _ := reg.List(registry.WithType(pb.ItemType_EDGE))

				// Iterate first to retrieve all servers
				for _, edge := range edges {
					if edge.Name() != "Node" {
						continue
					}

					e := edge.(registry.Edge)

					vv := e.Vertices()
					if vv[1] == process.ID() {
						servers = append(servers, vv[0])
					} else if vv[0] == process.ID() {
						servers = append(servers, vv[1])
					}
				}

				// Then all services
				for _, edge := range edges {
					e := edge.(registry.Edge)

					vv := e.Vertices()
					for _, server := range servers {
						if vv[1] == server {
							services = append(services, vv[0])
						} else if vv[0] == server {
							services = append(services, vv[1])
						}
					}
				}

				for _, service := range services {
					node, _ := reg.Get(service, registry.WithType(pb.ItemType_SERVICE))
					if node != nil {
						reg.Deregister(node)
					}
				}

				for _, server := range servers {
					node, _ := reg.Get(server, registry.WithType(pb.ItemType_SERVER))
					if node != nil {
						reg.Deregister(node)
					}
				}

				reg.Deregister(registry.Item(process))
			}()
		}
	}()
	ii = append(ii, util.CreateAddress(s.id+"-instance", nil))
	return
}

func (s *Server) Stop() error {
	if s.process != nil {
		s.process.Stop()
	}
	return nil
}

func (s *Server) ID() string {
	return s.id
}

func (s *Server) Name() string {
	return s.name
}

func (s *Server) Type() server.Type {
	return server.TypeFork
}

func (s *Server) Metadata() map[string]string {
	return s.meta // map[string]string{}
}

func (s *Server) Endpoints() []string {
	return []string{}
}

func (s *Server) As(i interface{}) bool {
	v, ok := i.(**ForkServer)
	if !ok {
		return false
	}

	*v = s.s

	return true
}

type ForkServer struct {
	name string
}

func (f *ForkServer) RegisterForkParam(name string) {
	f.name = name
}
