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

	"github.com/pkg/errors"
	"golang.org/x/sync/errgroup"

	"github.com/pydio/cells/v4/common/registry"
	servercontext "github.com/pydio/cells/v4/common/server/context"
)

type CoreServer interface {
	Name() string
	ID() string
	Type() Type
	Metadata() map[string]string
	As(interface{}) bool
}

type RawServer interface {
	CoreServer
	Stop() error
	RawServe(options *ServeOptions) ([]registry.Item, error)
}

type Server interface {
	CoreServer
	Serve(...ServeOption) error
	Stop(oo ...registry.RegisterOption) error
	RegisterBeforeStop(func(oo ...registry.RegisterOption) error)
	RegisterAfterStop(func(oo ...registry.RegisterOption) error)
}

type Type int8

const (
	TypeGrpc Type = iota
	TypeHttp
	TypeGeneric
	TypeFork
)

type server struct {
	s           RawServer
	opts        *Options
	status      string
	beforeStops []func(oo ...registry.RegisterOption) error
	afterStops  []func(oo ...registry.RegisterOption) error
}

func NewServer(ctx context.Context, s RawServer) Server {

	srv := &server{
		s: s,
		opts: &Options{
			Context: ctx,
		},
		status: "stopped",
	}

	if reg := servercontext.GetRegistry(ctx); reg != nil {
		if err := reg.Register(srv); err != nil {
			fmt.Println("[ERROR] Cannot register Server " + err.Error())
		}
	}
	return srv
}

func (s *server) Server() {}

func (s *server) Serve(oo ...ServeOption) (outErr error) {
	defer func() {
		if outErr != nil {
			outErr = errors.Wrap(outErr, "server.Start "+s.Name())
		}
	}()
	opt := &ServeOptions{}
	for _, o := range oo {
		o(opt)
	}

	// Register Stop handlers to this server
	for _, a := range opt.BeforeStop {
		s.beforeStops = append(s.beforeStops, a)
	}
	for _, a := range opt.AfterStop {
		s.afterStops = append(s.afterStops, a)
	}

	var g errgroup.Group
	for _, h := range opt.BeforeServe {
		func(bs func(oo ...registry.RegisterOption) error) {
			g.Go(func() error {
				return bs(opt.RegistryOptions...)
			})
		}(h)
	}
	if er := g.Wait(); er != nil {
		return er
	}

	ii, err := s.s.RawServe(opt)
	if err != nil {
		return err
	}
	s.status = "ready"

	// Making sure we register the endpoints
	if reg := servercontext.GetRegistry(s.opts.Context); reg != nil {
		// Update for status
		if err := reg.Register(s); err != nil {
			return err
		}
		for _, item := range ii {
			if err := reg.Register(item, registry.WithEdgeTo(s.ID(), "instance", nil)); err != nil {
				return err
			}
		}
	}

	// Apply AfterServe non-blocking
	for _, h := range opt.AfterServe {
		if er := h(); er != nil {
			fmt.Println("There was an error while applying an AfterServe", er)
		}
	}

	return nil
}

func (s *server) Stop(oo ...registry.RegisterOption) error {
	if err := s.doBeforeStop(oo...); err != nil {
		return err
	}

	if err := s.s.Stop(); err != nil {
		return err
	}

	opts := &registry.RegisterOptions{}
	for _, o := range oo {
		o(opts)
	}

	// We deregister the endpoints to clear links and re-register as stopped
	if reg := servercontext.GetRegistry(s.opts.Context); reg != nil {
		if er := reg.Deregister(s, registry.WithRegisterFailFast()); er != nil {
			return er
		} else if !opts.DeregisterFull {
			s.status = "stopped"
			_ = reg.Register(s, registry.WithRegisterFailFast())
		}
	}

	if err := s.doAfterStop(oo...); err != nil {
		return err
	}

	return nil
}

func (s *server) ID() string {
	return s.s.ID()
}

func (s *server) Name() string {
	return s.s.Name()
}

func (s *server) Type() Type {
	return s.s.Type()
}

func (s *server) Metadata() map[string]string {
	meta := make(map[string]string)
	for k, v := range s.s.Metadata() {
		meta[k] = v
	}
	meta["status"] = s.status
	return meta
}

func (s *server) RegisterBeforeStop(f func(oo ...registry.RegisterOption) error) {
	s.beforeStops = append(s.beforeStops, f)
}

func (s *server) RegisterAfterStop(f func(oo ...registry.RegisterOption) error) {
	s.afterStops = append(s.afterStops, f)
}

func (s *server) doBeforeStop(oo ...registry.RegisterOption) error {
	defer func() {
		// Empty beforeStops
		s.beforeStops = []func(oo ...registry.RegisterOption) error{}
	}()
	for _, h := range s.beforeStops {
		if err := h(oo...); err != nil {
			return err
		}
	}

	return nil
}

func (s *server) doAfterStop(oo ...registry.RegisterOption) error {
	defer func() {
		// Empty afterStops
		s.afterStops = []func(oo ...registry.RegisterOption) error{}
	}()
	for _, h := range s.afterStops {
		if err := h(oo...); err != nil {
			return err
		}
	}
	return nil
}

func (s *server) As(i interface{}) bool {
	if v, ok := i.(*Server); ok {
		*v = s
		return true
	} else if v, ok := i.(*registry.Server); ok {
		*v = s
		return true
	}

	return s.s.As(i)
}
