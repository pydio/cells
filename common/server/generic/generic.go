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

package generic

import (
	"context"
	"net/url"

	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type Server struct {
	id   string
	name string
	meta map[string]string

	cancel   context.CancelFunc
	handlers []func() error
}

type Handler interface {
	Start() error
	Stop() error
}

func init() {
	server.DefaultURLMux().Register("generic", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	return New(ctx), nil
}

func New(ctx context.Context) server.Server {
	ctx, cancel := context.WithCancel(ctx)
	return server.NewServer(ctx, &Server{
		id:   "generic-" + uuid.New(),
		name: "generic-" + uuid.New(),
		meta: make(map[string]string),

		cancel: cancel,
	})
}

func (s *Server) RegisterHandler(h Handler) {
	s.Handle(h.Start)
}

func (s *Server) Handle(h func() error) {
	s.handlers = append(s.handlers, h)
}

func (s *Server) RawServe(*server.ServeOptions) (ii []registry.Item, er error) {
	go func() {
		defer s.cancel()

		for _, handler := range s.handlers {
			go handler()
		}
	}()

	ii = append(ii, util.CreateAddress(s.id+"instance", nil))
	return
}

func (s *Server) Stop() error {
	return nil
}

func (s *Server) ID() string {
	return s.id
}

func (s *Server) Name() string {
	return s.name
}

func (s *Server) Type() server.Type {
	return server.TypeGeneric
}

func (s *Server) Metadata() map[string]string {
	return s.meta // map[string]string{}
}

func (s *Server) SetMetadata(meta map[string]string) {
	s.meta = meta
}

func (s *Server) Endpoints() []string {
	return []string{}
}

func (s *Server) As(i interface{}) bool {
	p, ok := i.(**Server)
	if !ok {
		return false
	}

	*p = s
	return true
}
