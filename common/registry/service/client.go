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
	"net/url"
	"sync"
	"time"

	"google.golang.org/grpc"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"

	"github.com/pydio/cells/v5/common"
	cgrpc "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/registry/util"
)

var schemes = []string{"grpc", "xds"}

type URLOpener struct {
	grpc.ClientConnInterface
}

func init() {
	o := &URLOpener{}
	for _, scheme := range schemes {
		registry.DefaultURLMux().Register(scheme, o)
	}
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (registry.Registry, error) {
	conn := cgrpc.ResolveConn(ctx, common.ServiceRegistryGRPC)

	return NewRegistry(WithConn(conn))
}

type serviceRegistry struct {
	opts Options
	// address
	address []string
	// client to call registry
	client pb.RegistryClient
	// session client
	sessionClient pb.Registry_SessionClient
	// health client to registry
	donec chan struct{}
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
		return errors.New("should have a grpc connection")
	}

	s.client = pb.NewRegistryClient(conn)
	sessionClient, err := s.client.Session(s.opts.Context, s.callOpts()...)
	if err != nil {
		return err
	}

	s.sessionClient = sessionClient

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
	if _, err := s.client.Start(s.opts.Context, util.ToProtoItem(item)); err != nil {
		return err
	}

	return nil
}

func (s *serviceRegistry) Stop(item registry.Item) error {
	if _, err := s.client.Stop(s.opts.Context, util.ToProtoItem(item)); err != nil {
		return err
	}
	return nil
}

func (s *serviceRegistry) lazyClient() error {
	sessionClient, err := s.client.Session(s.opts.Context, s.callOpts()...)
	if err != nil {
		return err
	}

	s.sessionClient = sessionClient

	return nil
}

func (s *serviceRegistry) Register(item registry.Item, option ...registry.RegisterOption) error {
	if s.sessionClient == nil {
		if err := s.lazyClient(); err != nil {
			return err
		}
	}

	if err := s.sessionClient.Send(&pb.SessionRequest{
		Type: pb.SessionRequestType_REGISTER,
		Item: util.ToProtoItem(item),
	}); err != nil {
		return err
	}

	if _, err := s.sessionClient.Recv(); err != nil {
		return err
	}

	return nil
}

func (s *serviceRegistry) Deregister(item registry.Item, option ...registry.RegisterOption) error {
	if s.sessionClient == nil {
		if err := s.lazyClient(); err != nil {
			return err
		}
	}

	if err := s.sessionClient.Send(&pb.SessionRequest{
		Type: pb.SessionRequestType_DEREGISTER,
		Item: util.ToProtoItem(item),
	}); err != nil {
		return err
	}

	if _, err := s.sessionClient.Recv(); err != nil {
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
			Ids:   options.IDs,
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
			Ids:     options.IDs,
			Names:   options.Names,
			Types:   options.Types,
		},
	}, s.callOpts()...)
	if err != nil {
		return nil, err
	}

	return newStreamWatcher(stream, options), nil
}

func (s *serviceRegistry) NewLocker(prefix string) sync.Locker {
	stream, _ := s.client.NewLocker(s.opts.Context)

	return &serviceRegistryLock{
		prefix: prefix,
		stream: stream,
	}
}

type serviceRegistryLock struct {
	prefix string
	stream pb.Registry_NewLockerClient
}

func (s *serviceRegistryLock) Lock() {
	if s.stream != nil {
		s.stream.Send(&pb.NewLockerRequest{
			Prefix: s.prefix,
			Type:   pb.LockType_Lock,
		})

		resp, err := s.stream.Recv()
		if err != nil {
			return
		}

		if resp.GetType() == pb.LockType_Lock {
			return
		}
	}
}

func (s *serviceRegistryLock) Unlock() {
	if s.stream != nil {
		s.stream.SendMsg(&pb.NewLockerRequest{
			Prefix: s.prefix,
			Type:   pb.LockType_Unlock,
		})

		resp, err := s.stream.Recv()
		if err != nil {
			return
		}

		if resp.GetType() == pb.LockType_Lock {
			return
		}

		s.stream.CloseSend()
	}
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
		return nil, errors.New("should have a grpc connection")
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

	cli := pb.NewRegistryClient(conn)

	r := &serviceRegistry{
		opts:   options,
		client: cli,
		donec:  donec,
	}

	return registry.GraphRegistry(r), nil
}
