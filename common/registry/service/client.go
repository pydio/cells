/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
	"context"
	"github.com/pydio/cells/v4/common"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
	"net/url"
	"time"

	cgrpc "github.com/pydio/cells/v4/common/client/grpc"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var scheme = "grpc"

type URLOpener struct {
	grpc.ClientConnInterface
}

func init() {
	o := &URLOpener{}
	registry.DefaultURLMux().Register(scheme, o)
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (registry.Registry, error) {
	// We use WithBlock, shall we timeout and retry here ?
	var conn grpc.ClientConnInterface

	address := u.Hostname()
	if port := u.Port(); port != "" {
		address = address + ":" + port
	}
	var cli *grpc.ClientConn
	var err error
	if u.Query().Get("timeout") != "" {
		if d, e := time.ParseDuration(u.Query().Get("timeout")); e != nil {
			return nil, e
		} else {
			ct, _ := context.WithTimeout(ctx, d)
			cli, err = grpc.DialContext(ct, u.Hostname()+":"+u.Port(), grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock())
		}
	} else {
		cli, err = grpc.Dial(u.Hostname()+":"+u.Port(), grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock())
	}

	if err != nil {
		return nil, err
	}

	conn = cgrpc.NewClientConn("pydio.grpc.registry", cgrpc.WithClientConn(cli))

	if err != nil {
		return nil, err
	}

	return NewRegistry(WithConn(conn))
}

type serviceRegistry struct {
	opts Options
	// address
	address []string
	// client to call registry
	client pb.RegistryClient
	// health client to registry
	donec chan struct{}

	// events
	hasStream bool
	// listeners
	listeners []chan registry.Result
}

func (s *serviceRegistry) callOpts() []grpc.CallOption {
	var opts []grpc.CallOption

	// set registry address
	//if len(s.address) > 0 {
	//	opts = append(opts, client.WithAddress(s.address...))
	//}

	// set timeout
	if s.opts.Timeout > time.Duration(0) {
		// opts = append(opts, grpc.client.WithRequestTimeout(s.opts.Timeout))
	}

	// add retries
	// TODO : charles' GUTS feeling :-)
	// opts = append(opts, client.WithRetries(10))

	return opts
}

func (s *serviceRegistry) Init(opts ...Option) error {
	for _, o := range opts {
		o(&s.opts)
	}

	if len(s.opts.Addrs) > 0 {
		s.address = s.opts.Addrs
	}

	// extract the client from the context, fallback to grpc
	var conn *grpc.ClientConn
	if c, ok := s.opts.Context.Value(connKey{}).(*grpc.ClientConn); ok {
		conn = c
	} else {
		conn, _ = grpc.Dial(":8000")
	}

	s.client = pb.NewRegistryClient(conn)

	return nil
}

func (s *serviceRegistry) Options() Options {
	return s.opts
}

func (s *serviceRegistry) Close() error {
	return nil
}

func (s *serviceRegistry) Done() <-chan struct{} {
	return s.donec
}

func (s *serviceRegistry) Start(item registry.Item) error {
	_, err := s.client.Start(s.opts.Context, util.ToProtoItem(item), s.callOpts()...)
	if err != nil {
		return err
	}

	return nil
}

func (s *serviceRegistry) Stop(item registry.Item) error {
	_, err := s.client.Stop(s.opts.Context, util.ToProtoItem(item), s.callOpts()...)
	if err != nil {
		return err
	}

	return nil
}

func (s *serviceRegistry) Register(item registry.Item, option ...registry.RegisterOption) error {
	var opts = &registry.RegisterOptions{}
	for _, o := range option {
		o(opts)
	}
	callOpts := s.callOpts()
	ctx := s.opts.Context
	if opts.FailFast {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, 1*time.Second)
		defer cancel()
		callOpts = append(callOpts, grpc.WaitForReady(false))
	}
	_, err := s.client.Register(ctx, util.ToProtoItem(item), callOpts...)
	if err != nil {
		return err
	}

	return nil
}

func (s *serviceRegistry) Deregister(item registry.Item, option ...registry.RegisterOption) error {
	var opts = &registry.RegisterOptions{}
	for _, o := range option {
		o(opts)
	}
	callOpts := s.callOpts()
	ctx := s.opts.Context
	if opts.FailFast {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, 1*time.Second)
		defer cancel()
		callOpts = append(callOpts, grpc.WaitForReady(false))
	}
	_, err := s.client.Deregister(ctx, util.ToProtoItem(item), callOpts...)
	if err != nil {
		return err
	}
	return nil
}

func (s *serviceRegistry) Get(id string, opts ...registry.Option) (registry.Item, error) {
	var options registry.Options
	for _, o := range opts {
		o(&options)
	}

	rsp, err := s.client.Get(s.opts.Context, &pb.GetRequest{
		Id: id,
		Options: &pb.Options{
			Types: options.Types,
		},
	}, s.callOpts()...)
	if err != nil {
		return nil, err
	}

	return util.ToItem(rsp.Item), nil
}

func (s *serviceRegistry) List(opts ...registry.Option) ([]registry.Item, error) {
	var options registry.Options
	for _, o := range opts {
		o(&options)
	}
	cOpts := s.callOpts()
	if options.FailFast {
		cOpts = append(cOpts, grpc.WaitForReady(false))
	}
	rsp, err := s.client.List(s.opts.Context, &pb.ListRequest{
		Options: &pb.Options{
			Types: options.Types,
			Names: options.Names,
		},
	}, cOpts...)
	if err != nil {
		return nil, err
	}

	items := make([]registry.Item, 0, len(rsp.Items))
	for _, item := range rsp.Items {
		casted := util.ToItem(item)
		accept := true
		for _, filter := range options.Filters {
			if !filter(casted) {
				accept = false
				break
			}
		}
		if !accept {
			continue
		}
		items = append(items, casted)
	}

	return items, nil
}

func (s *serviceRegistry) Watch(opts ...registry.Option) (registry.Watcher, error) {
	var options registry.Options
	for _, o := range opts {
		o(&options)
	}

	// This is a first watch, setup a stream - opts are empty
	stream, err := s.client.Watch(s.opts.Context, &pb.WatchRequest{
		Options: &pb.Options{
			Actions: options.Actions,
			Names:   options.Names,
			Types:   options.Types,
		},
	}, s.callOpts()...)
	if err != nil {
		return nil, err
	}

	s.hasStream = true
	return newStreamWatcher(stream, options), nil
}

func (s *serviceRegistry) As(interface{}) bool {
	return false
}

func (s *serviceRegistry) String() string {
	return "service"
}

// NewRegistry returns a new registry service client
func NewRegistry(opts ...Option) (registry.Registry, error) {
	var options Options
	for _, o := range opts {
		o(&options)
	}

	ctx := options.Context
	if ctx == nil {
		ctx = context.TODO()
	}

	options.Context = ctx

	// extract the client from the context, fallback to grpc
	var conn grpc.ClientConnInterface
	conn, ok := options.Context.Value(connKey{}).(grpc.ClientConnInterface)
	if !ok {
		conn, _ = grpc.Dial(":8000")
	}

	donec := make(chan struct{})

	go func() {
		defer close(donec)

		cli := healthpb.NewHealthClient(conn)

		w, err := cli.Watch(options.Context, &healthpb.HealthCheckRequest{Service: common.ServiceGrpcNamespace_ + common.ServiceRegistry})
		if err != nil {
			return
		}

		for {
			_, err := w.Recv()
			if err != nil {
				return
			}

			// Status unknown, continue
		}
	}()

	r := &serviceRegistry{
		opts:   options,
		client: pb.NewRegistryClient(conn),
		donec:  donec,
	}

	return registry.GraphRegistry(r), nil
}
