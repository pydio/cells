/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package service

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"

	limiter "github.com/micro/go-plugins/wrapper/ratelimiter/uber"

	micro "github.com/micro/go-micro"
	"github.com/micro/go-micro/codec"
	"github.com/micro/go-micro/server"
	"github.com/micro/misc/lib/addr"

	microregistry "github.com/micro/go-micro/registry"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/registry"
	servicecontext "github.com/pydio/cells/common/service/context"
	proto "github.com/pydio/cells/common/service/proto"
)

// WithGeneric runs a micro server
func WithGeneric(f func(...server.Option) server.Server) ServiceOption {
	return func(o *ServiceOptions) {
		o.Version = common.Version().String()

		o.MicroInit = func(s Service) error {
			svc := micro.NewService(
				micro.Cmd(command),
			)

			name := s.Name()

			ctx := servicecontext.WithServiceName(s.Options().Context, name)

			srv := f(
				server.Name(name),
				server.Id(o.ID),
				server.Address(s.Address()),
				server.RegisterTTL(DefaultRegisterTTL),
			)

			opts := []micro.Option{
				micro.Version(o.Version),
				micro.Client(defaults.NewClient()),
				micro.Server(srv),
				micro.Registry(defaults.Registry()),
				micro.RegisterTTL(DefaultRegisterTTL),
				micro.RegisterInterval(randomTimeout(DefaultRegisterTTL / 2)),
				micro.Transport(defaults.Transport()),
				micro.Broker(defaults.Broker()),
				micro.Context(ctx),
				micro.AfterStart(func() error {
					log.Logger(ctx).Info("Started")

					return nil
				}),
				micro.BeforeStop(func() error {
					log.Logger(ctx).Info("Stopping")

					return nil
				}),
			}

			if rateLimit, err := strconv.Atoi(os.Getenv("GENERIC_RATE_LIMIT")); err == nil {
				opts = append(opts, micro.WrapHandler(limiter.NewHandlerWrapper(rateLimit)))
			}

			svc.Init(
				opts...,
			)

			meta := registry.BuildServiceMeta()
			meta["description"] = o.Description

			// Make sure to add after
			svc.Init(
				micro.Metadata(meta),
			)

			s.Init(
				Micro(svc),
			)

			return nil
		}
	}
}

// WithHTTP adds a http micro service handler to the current service
func WithHTTP(handlerFunc func() http.Handler) ServiceOption {
	return func(o *ServiceOptions) {
		o.Version = common.Version().String()

		o.MicroInit = func(s Service) error {
			svc := micro.NewService(
				micro.Cmd(command),
			)

			name := s.Name()
			ctx := servicecontext.WithServiceName(s.Options().Context, name)
			o.Version = common.Version().String()

			opts := []server.Option{
				server.Name(name),
				server.Id(o.ID),
				server.RegisterTTL(DefaultRegisterTTL),
			}
			if port := s.Options().Port; port != "0" {
				opts = append(opts, server.Address(":"+port))
			}

			srv := defaults.NewHTTPServer(
				opts...,
			)

			hd := srv.NewHandler(handlerFunc())

			err := srv.Handle(hd)
			if err != nil {
				return err
			}

			svcOpts := []micro.Option{
				micro.Version(o.Version),
				micro.Registry(defaults.Registry()),
				micro.Context(ctx),
				micro.Name(name),
				micro.RegisterTTL(DefaultRegisterTTL),
				micro.RegisterInterval(randomTimeout(DefaultRegisterTTL / 2)),
				micro.AfterStart(func() error {
					log.Logger(ctx).Info("Started")

					return nil
				}),
				micro.BeforeStop(func() error {
					log.Logger(ctx).Info("Stopping")

					return nil
				}),
				micro.AfterStart(func() error {
					return UpdateServiceVersion(s)
				}),
				micro.Server(srv),
			}

			if rateLimit, err := strconv.Atoi(os.Getenv("HTTP_RATE_LIMIT")); err == nil {
				svcOpts = append(svcOpts, micro.WrapHandler(limiter.NewHandlerWrapper(rateLimit)))
			}

			svc.Init(
				svcOpts...,
			)

			meta := registry.BuildServiceMeta()
			meta["description"] = o.Description

			// Make sure to add after
			svc.Init(
				micro.Metadata(registry.BuildServiceMeta()),
			)

			// newTracer(name, &options)
			newConfigProvider(svc)
			newLogProvider(svc)

			// We should actually offer that possibility
			proto.RegisterServiceHandler(svc.Server(), &StatusHandler{s.Address()})

			s.Init(
				Micro(svc),
			)

			return nil
		}
	}
}

type genericServer struct {
	srv interface{}

	opts server.Options
	sync.RWMutex
	registered bool
}

// NewGenericServer wraps a micro server out of a simple interface
func NewGenericServer(srv interface{}, opt ...server.Option) server.Server {
	opts := server.Options{
		Address:  server.DefaultAddress,
		Codecs:   make(map[string]codec.NewCodec),
		Metadata: map[string]string{},
	}

	for _, o := range opt {
		o(&opts)
	}

	return &genericServer{
		srv:  srv,
		opts: opts,
	}
}

func (g *genericServer) Options() server.Options {
	return g.opts
}
func (g *genericServer) Init(opts ...server.Option) error {
	for _, opt := range opts {
		opt(&g.opts)
	}
	return nil
}
func (g *genericServer) Handle(server.Handler) error {
	return errors.New("not implemented")
}
func (g *genericServer) NewHandler(interface{}, ...server.HandlerOption) server.Handler {
	return nil
}
func (g *genericServer) NewSubscriber(string, interface{}, ...server.SubscriberOption) server.Subscriber {
	return nil
}
func (g *genericServer) Subscribe(server.Subscriber) error {
	return errors.New("not implemented")
}
func (g *genericServer) Register() error {
	// parse address for host, port
	config := g.opts

	nodes, err := g.getNodes()
	if err != nil {
		return err
	}

	service := &microregistry.Service{
		Name:    config.Name,
		Version: config.Version,
		Nodes:   nodes,
	}

	g.Lock()
	registered := g.registered
	g.Unlock()

	// create registry options
	rOpts := []microregistry.RegisterOption{
		microregistry.RegisterTTL(config.RegisterTTL),
	}

	if err := config.Registry.Register(service, rOpts...); err != nil {
		return err
	}

	// already registered? don't need to register subscribers
	if registered {
		return nil
	}

	g.Lock()
	defer g.Unlock()

	g.registered = true

	return nil
}

func (g *genericServer) Deregister() error {
	config := g.opts

	nodes, err := g.getNodes()
	if err != nil {
		return err
	}

	service := &microregistry.Service{
		Name:    config.Name,
		Version: config.Version,
		Nodes:   nodes,
	}

	if err := config.Registry.Deregister(service); err != nil {
		return err
	}

	g.Lock()

	if !g.registered {
		g.Unlock()
		return nil
	}

	g.registered = false

	return nil
}

func (g *genericServer) Start() error {
	if s, ok := g.srv.(Starter); ok {
		return s.Start()
	}
	return nil
}
func (g *genericServer) Stop() error {
	if s, ok := g.srv.(Stopper); ok {
		return s.Stop()
	}
	return nil
}
func (g *genericServer) String() string {
	return "generic"
}

func (g *genericServer) getNodes() ([]*microregistry.Node, error) {
	config := g.opts

	var advt, host string
	var port int

	var nodes []*microregistry.Node
	if a, ok := g.srv.(Addressable); ok {
		for k, address := range a.Addresses() {
			tcp, ok := address.(*net.TCPAddr)
			if !ok {
				continue
			}
			ip := tcp.IP.String()
			if ip == "::" {
				ip = "[::]"
			}
			ad, err := addr.Extract(ip)
			if err != nil {
				ad = config.Address
			}
			md := make(map[string]string, len(config.Metadata))
			for k, v := range config.Metadata {
				md[k] = v
			}

			id := config.Name + "-" + config.Id
			if k > 0 {
				id = fmt.Sprintf("%s-%d", id, k)
			}
			// register service
			node := &microregistry.Node{
				Id:       id,
				Address:  ad,
				Port:     tcp.Port,
				Metadata: md,
			}

			node.Metadata["broker"] = config.Broker.String()
			node.Metadata["registry"] = config.Registry.String()
			node.Metadata["server"] = g.String()
			node.Metadata["transport"] = g.String()

			nodes = append(nodes, node)
		}
	} else {
		// check the advertise address first
		// if it exists then use it, otherwise
		// use the address
		if len(config.Advertise) > 0 {
			advt = config.Advertise
		} else {
			advt = config.Address
		}

		parts := strings.Split(advt, ":")
		if len(parts) > 1 {
			host = strings.Join(parts[:len(parts)-1], ":")
			port, _ = strconv.Atoi(parts[len(parts)-1])
		} else {
			host = parts[0]
		}

		ad, err := addr.Extract(host)
		if err != nil {
			return nil, err
		}
		md := make(map[string]string, len(config.Metadata))
		for k, v := range config.Metadata {
			md[k] = v
		}
		// register service
		node := &microregistry.Node{
			Id:       config.Name + "-" + config.Id,
			Address:  ad,
			Port:     port,
			Metadata: md,
		}

		node.Metadata["broker"] = config.Broker.String()
		node.Metadata["registry"] = config.Registry.String()
		node.Metadata["server"] = g.String()
		node.Metadata["transport"] = g.String()

		if na, ok := g.srv.(NonAddressable); ok {
			node.Metadata["non-addressable"] = na.NoAddress()
		}

		nodes = append(nodes, node)
	}

	return nodes, nil
}
