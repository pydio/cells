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

	"golang.org/x/sync/errgroup"

	"github.com/pydio/cells/v4/common/registry"
	servercontext "github.com/pydio/cells/v4/common/server/context"
)

type CoreServer interface {
	Stop() error
	Name() string
	ID() string
	Type() Type
	Metadata() map[string]string
	As(interface{}) bool
}

type RawServer interface {
	CoreServer
	RawServe(options *ServeOptions) ([]registry.Item, error)
}

type Server interface {
	CoreServer
	Serve(...ServeOption) error
	BeforeServe(func() error)
	AfterServe(func() error)
	BeforeStop(func() error)
	AfterStop(func() error)
}

type ServeOptions struct {
	HttpBindAddress string
	GrpcBindAddress string
	ErrorCallback   func(error)
}

type ServeOption func(options *ServeOptions)

func WithErrorCallback(cb func(err error)) ServeOption {
	return func(options *ServeOptions) {
		options.ErrorCallback = cb
	}
}

func WithGrpcBindAddress(a string) ServeOption {
	return func(o *ServeOptions) {
		o.GrpcBindAddress = a
	}
}

func WithHttpBindAddress(a string) ServeOption {
	return func(o *ServeOptions) {
		o.HttpBindAddress = a
	}
}

type Type int8

const (
	TypeGrpc Type = iota
	TypeHttp
	TypeGeneric
	TypeFork
)

type server struct {
	s    RawServer
	opts *Options
}

func NewServer(ctx context.Context, s RawServer) Server {

	srv := &server{
		s: s,
		opts: &Options{
			Context: ctx,
		},
	}

	if reg := servercontext.GetRegistry(ctx); reg != nil {
		if err := reg.Register(srv); err != nil {
			fmt.Println("[ERROR] Cannot register Server " + err.Error())
		}
	}
	return srv
}

func (s *server) Server() {}

func (s *server) Serve(oo ...ServeOption) error {
	opt := &ServeOptions{}
	for _, o := range oo {
		o(opt)
	}

	if err := s.doBeforeServe(); err != nil {
		return err
	}

	ii, err := s.s.RawServe(opt)
	if err != nil {
		return err
	}

	// Making sure we register the endpoints
	if reg := servercontext.GetRegistry(s.opts.Context); reg != nil {
		for _, item := range ii {
			if err := reg.Register(item); err != nil {
				return err
			}
			if _, err := reg.RegisterEdge(s.ID(), item.ID(), "instance", nil); err != nil {
				return err
			}
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

	// Making sure we deregister the endpoints
	if reg := servercontext.GetRegistry(s.opts.Context); reg != nil {
		if er := reg.Deregister(s); er != nil {
			return er
		}
	}

	if err := s.doAfterStop(); err != nil {
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
	} else if v, ok := i.(*registry.Server); ok {
		*v = s
		return true
	}

	return s.s.As(i)
}
