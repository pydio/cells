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
	"sync"
	"time"

	"github.com/pkg/errors"
	"golang.org/x/exp/maps"
	"golang.org/x/sync/errgroup"

	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/std"
)

type CoreServer interface {
	Name() string
	ID() string
	Type() Type
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

	Is(status registry.Status) bool
	NeedsRestart() bool
	Metadata() map[string]string

	RegisterContextInterceptor(interceptor propagator.IncomingContextModifier)
}

type Type int8

const (
	TypeGrpc Type = iota
	TypeHttp
	TypeHttpPure
	TypeGeneric
	TypeFork
)

type server struct {
	S     RawServer
	Opts  *Options
	links []registry.Item

	lock    sync.Mutex
	stopped bool
}

var servers []Server

func NewServer(ctx context.Context, s RawServer) Server {
	srv := &server{
		S: s,
		Opts: &Options{
			Context: ctx,
			Metadata: map[string]string{
				registry.MetaStatusKey: string(registry.StatusStopped),
			},
		},
	}

	servers = append(servers, srv)

	var reg registry.Registry
	if propagator.Get(ctx, registry.ContextKey, &reg) {
		if err := reg.Register(srv); err != nil {
			fmt.Println("[ERROR] Cannot register Server " + err.Error())
		}
	}

	return srv
}

func Get(out interface{}) bool {
	for _, srv := range servers {
		if srv.As(out) {
			return true
		}
	}

	return false
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

	if opt.BlockUntilServe {
		for _, h := range opt.BeforeServe {
			if err := h(opt.RegistryOptions...); err != nil {
				return err
			}
		}
	} else {

		g := &errgroup.Group{}
		for _, h := range opt.BeforeServe {
			func(bs func(oo ...registry.RegisterOption) error) {
				g.Go(func() error {
					ch := make(chan error, 1)

					go func() {
						ch <- bs(opt.RegistryOptions...)
					}()

					select {
					case <-time.After(10 * time.Second):
						return errors.New("[ERROR] BeforeServe timeout")
					case err := <-ch:
						return err
					}
				})
			}(h)
		}

		if er := g.Wait(); er != nil {
			return er
		}
	}

	_, err := s.S.RawServe(opt)
	if err != nil {
		fmt.Println("Cannot RawServe", err)
		return err
	}

	//// Making sure we register the endpoints
	//var reg registry.Registry
	//if propagator.Get(s.Opts.Context, registry.ContextKey, &reg) {
	//	for _, item := range ii {
	//		if err := reg.Register(item, registry.WithEdgeTo(s.ID(), "instance", nil)); err != nil {
	//			return err
	//		}
	//
	//		s.links = append(s.links, item)
	//	}
	//
	//	// Update for status
	//	if err := reg.Register(s); err != nil {
	//		return err
	//	}
	//}

	if opt.BlockUntilServe {
		for _, h := range opt.AfterServe {
			if err := h(opt.RegistryOptions...); err != nil {
				return err
			}
		}
	} else {
		g2 := &errgroup.Group{}
		for _, h := range opt.AfterServe {
			func(as func(oo ...registry.RegisterOption) error) {
				g2.Go(func() error {
					ch := make(chan error, 1)

					go func() {
						ch <- as(opt.RegistryOptions...)
					}()

					select {
					case <-time.After(10 * time.Second):
						return errors.New("[ERROR] BeforeServe timeout")
					case err := <-ch:
						return err
					}
				})
			}(h)
		}

		if er := g2.Wait(); er != nil {
			return er
		}
	}

	return nil
}

func (s *server) Stop(oo ...registry.RegisterOption) error {
	s.lock.Lock()
	defer s.lock.Unlock()
	if s.stopped {
		return nil
	}

	if err := s.S.Stop(); err != nil {
		return err
	}

	s.stopped = true

	opts := &registry.RegisterOptions{}
	for _, o := range oo {
		o(opts)
	}

	// We deregister the endpoints to clear links and re-register as stopped
	var reg registry.Registry
	if propagator.Get(s.Opts.Context, registry.ContextKey, &reg) {
		for _, i := range s.links {
			_ = reg.Deregister(i, registry.WithRegisterFailFast())
		}
		if er := reg.Deregister(s, registry.WithRegisterFailFast()); er != nil {
			return er
		} else if !opts.DeregisterFull {
			meta := s.Metadata()
			meta[registry.MetaStatusKey] = string(registry.StatusStopped)
			s.SetMetadata(meta)
			_ = reg.Register(s, registry.WithRegisterFailFast())
		}
	}

	return nil
}

func (s *server) ID() string {
	return s.S.ID()
}

func (s *server) Name() string {
	return s.S.Name()
}

func (s *server) Type() Type {
	return s.S.Type()
}

func (s *server) Is(status registry.Status) bool {
	return s.Metadata()[registry.MetaStatusKey] == string(status)
}

func (s *server) NeedsRestart() bool {
	return s.Type() == TypeGrpc
}

func (s *server) As(i interface{}) bool {
	if v, ok := i.(*Server); ok {
		*v = s
		return true
	} else if v, ok := i.(*registry.Server); ok {
		*v = s
		return true
	}

	return s.S.As(i)
}

func (s *server) Metadata() map[string]string {
	meta := maps.Clone(s.Opts.Metadata)
	return meta
}

func (s *server) SetMetadata(meta map[string]string) {
	s.Opts.Metadata = meta
}

func (s *server) Clone() interface{} {
	clone := &server{}
	clone.S = std.DeepClone(s.S)
	clone.Opts = &Options{
		Metadata: s.Metadata(),
	}

	return clone
}

func (s *server) RegisterContextInterceptor(interceptor propagator.IncomingContextModifier) {
	*s.Opts.interceptors = append(*s.Opts.interceptors, interceptor)
}
