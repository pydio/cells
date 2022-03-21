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
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/utils/fork"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type Server struct {
	id   string
	name string
	meta map[string]string

	ctx     context.Context
	process *fork.Process

	s *ForkServer
}

func NewServer(ctx context.Context) server.Server {
	return server.NewServer(ctx, &Server{
		id:   "fork-" + uuid.New(),
		name: "fork",
		meta: server.InitPeerMeta(),
		ctx:  ctx,
		s:    &ForkServer{},
	})
}

func (s *Server) Serve() error {

	var opts []fork.Option
	if config.Get("services", s.s.name, "debugFork").Bool() {
		opts = append(opts, fork.WithDebug())
	}
	if len(config.DefaultBindOverrideToFlags()) > 0 {
		opts = append(opts, fork.WithCustomFlags(config.DefaultBindOverrideToFlags()...))
	}
	opts = append(opts, fork.WithRetries(3))
	s.process = fork.NewProcess(s.ctx, []string{s.s.name}, opts...)

	var e error
	go func() {
		e = s.process.StartAndWait()
	}()
	return e
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

func (s *Server) Type() server.ServerType {
	return server.ServerType_FORK
}

func (s *Server) Metadata() map[string]string {
	return s.meta // map[string]string{}
}

func (s *Server) Address() []string {
	return []string{}
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
