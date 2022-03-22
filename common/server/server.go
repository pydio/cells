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

package server

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common/registry"

	servercontext "github.com/pydio/cells/v4/common/server/context"
	"golang.org/x/sync/errgroup"
)

type RawServer interface {
	Serve() error
	Stop() error
	Address() []string
	Name() string
	ID() string
	Type() ServerType
	Endpoints() []string
	Metadata() map[string]string
	As(interface{}) bool
}

type Server interface {
	RawServer
	BeforeServe(func() error)
	AfterServe(func() error)
	BeforeStop(func() error)
	AfterStop(func() error)
}

type ServerType int8

const (
	ServerType_GRPC ServerType = iota
	ServerType_HTTP
	ServerType_GENERIC
	ServerType_FORK
)

type server struct {
	s    RawServer
	opts *ServerOptions
}

func NewServer(ctx context.Context, s RawServer) Server {

	srv := &server{
		s: s,
		opts: &ServerOptions{
			Context: ctx,
		},
	}

	// reg := servercontext.GetRegistry(ctx)
	// reg.Register(srv)

	return srv
}

func (s *server) Serve() error {
	if err := s.doBeforeServe(); err != nil {
		return err
	}

	if err := s.s.Serve(); err != nil {
		return err
	}

	// Making sure we register the endpoints
	if reg := servercontext.GetRegistry(s.opts.Context); reg != nil {
		if err := reg.Register(s); err != nil {
			return err
		}
	}

	if err := s.doAfterServe(); err != nil {
		return err
	}

	return nil
}

func (s *server) Stop() error {
	if err := s.doBeforeStop(); err != nil {
		return err
	}

	if err := s.s.Stop(); err != nil {
		return err
	}

	// Making sure we register the endpoints
	if reg := servercontext.GetRegistry(s.opts.Context); reg != nil {
		reg.Deregister(s)
	}

	if err := s.doAfterStop(); err != nil {
		return err
	}

	return nil
}

func (s *server) Address() []string {
	return s.s.Address()
}

func (s *server) ID() string {
	return s.s.ID()
}

func (s *server) Name() string {
	return s.s.Name()
}

func (s *server) Type() ServerType {
	return s.s.Type()
}

func (s *server) Endpoints() []string {
	return s.s.Endpoints()
}

func (s *server) Metadata() map[string]string {
	return s.s.Metadata()
}

func (s *server) BeforeServe(f func() error) {
	s.opts.BeforeServe = append(s.opts.BeforeServe, f)
}

func (s *server) doBeforeServe() error {
	var g errgroup.Group

	for _, h := range s.opts.BeforeServe {
		g.Go(h)
	}

	return g.Wait()
}

func (s *server) AfterServe(f func() error) {
	s.opts.AfterServe = append(s.opts.AfterServe, f)
}

func (s *server) doAfterServe() error {
	// DO NOT USE ERRGROUP, OR ANY FAILING MIGRATION
	// WILL STOP THE Serve PROCESS
	//var g errgroup.Group

	for _, h := range s.opts.AfterServe {
		//g.Go(h)
		if er := h(); er != nil {
			fmt.Println("There was an error while applying an AfterServe", er)
		}
	}

	return nil //g.Wait()
}

func (s *server) BeforeStop(f func() error) {
	s.opts.BeforeStop = append(s.opts.BeforeStop, f)
}

func (s *server) doBeforeStop() error {
	for _, h := range s.opts.BeforeStop {
		if err := h(); err != nil {
			return err
		}
	}

	return nil
}

func (s *server) AfterStop(f func() error) {
	s.opts.AfterStop = append(s.opts.AfterStop, f)
}

func (s *server) doAfterStop() error {
	for _, h := range s.opts.AfterStop {
		if err := h(); err != nil {
			return err
		}
	}

	return nil
}

func (s *server) As(i interface{}) bool {
	if v, ok := i.(*Server); ok {
		*v = s
		return true
	} else if v, ok := i.(*registry.Node); ok {
		*v = s
		return true
	}

	return s.s.As(i)
}
