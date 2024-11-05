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
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/pydio/cells/v4/common"
	cgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	pb "github.com/pydio/cells/v4/common/proto/config"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	schemes = []string{"grpc", "xds"}
)

type URLOpener struct{}

func init() {
	o := &URLOpener{}
	for _, scheme := range schemes {
		config.DefaultURLMux().Register(scheme, o)
	}
}

func (o *URLOpener) Open(ctx context.Context, urlstr string) (config.Store, error) {
	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	store := New(ctx, cgrpc.ResolveConn(ctx, common.ServiceConfigGRPC), u.Query().Get("namespace"), "/")

	return store, nil
}

type remote struct {
	ctx            context.Context
	cli            pb.ConfigClient
	values         configx.Values
	id             string
	path           []string
	internalLocker *sync.RWMutex
	externalLocker *sync.RWMutex
	watchers       []*receiver
}

func New(ctx context.Context, conn grpc.ClientConnInterface, id string, path string) config.Store {
	cli := pb.NewConfigClient(conn)
	r := &remote{
		ctx:            ctx,
		cli:            pb.NewConfigClient(conn),
		id:             id,
		path:           strings.Split(path, "/"),
		internalLocker: &sync.RWMutex{},
		externalLocker: &sync.RWMutex{},
		values: configx.New(configx.WithStorer(&values{
			ctx: ctx,
			cli: cli,
			id:  id,
		})),
	}

	go func() {
		for {
			stream, err := r.cli.Watch(r.ctx, &pb.WatchRequest{
				Namespace: id,
				Path:      path,
			})

			if err != nil {
				fmt.Println(err)
				time.Sleep(1 * time.Second)
				continue
			}

			for {
				rsp, err := stream.Recv()
				if err != nil {
					if status.Convert(err).Code() == codes.Unimplemented {
						log.Debug("config watch is not implemented", zap.String("id", id))
						return
					}
					time.Sleep(1 * time.Second)
					break
				}

				c := configx.New(configx.WithJSON())
				_ = c.Set(rsp.GetValue().GetData())

				r.internalLocker.RLock()
				for _, w := range r.watchers {
					v := c.Val(w.path...).Bytes()

					select {
					case w.updates <- v:
					default:
					}
				}
				r.internalLocker.RUnlock()
			}

			_ = stream.CloseSend()
		}
	}()

	return r
}

func (r *remote) Context(ctx context.Context) configx.Values {
	return r.values.Context(ctx)
}

func (r *remote) Val(path ...string) configx.Values {
	return r.values.Val(path...)
}

func (r *remote) Default(data any) configx.Values {
	return r.values.Default(data)
}

func (r *remote) Options() *configx.Options {
	return r.values.Options()
}

func (r *remote) Key() []string {
	return r.values.Key()
}

func (r *remote) Get(wo ...configx.WalkOption) any {
	return r.values.Get(wo...)
}

func (r *remote) Set(value interface{}) error {
	return r.values.Set(value)
}

func (r *remote) Del() error {
	return nil
}

func (r *remote) As(out any) bool { return false }

func (r *remote) Close(_ context.Context) error {
	return nil
}

func (r *remote) Done() <-chan struct{} {
	// TODO - Maybe do something here ?
	return nil
}

func (r *remote) Save(ctxUser string, ctxMessage string) error {
	if _, err := r.cli.Save(r.ctx, &pb.SaveRequest{
		User:    ctxUser,
		Message: ctxMessage,
	}); err != nil {
		return err
	}

	return nil
}

func (r *remote) Lock() {
	r.externalLocker.Lock()
}

func (r *remote) Unlock() {
	r.externalLocker.Unlock()
}

func (r *remote) NewLocker(prefix string) sync.Locker {
	stream, _ := r.cli.NewLocker(r.ctx)

	return &remoteLock{
		prefix: prefix,
		stream: stream,
	}
}

type remoteLock struct {
	prefix string
	stream pb.Config_NewLockerClient
}

func (s *remoteLock) Lock() {
	if s.stream != nil {
		if err := s.stream.Send(&pb.NewLockerRequest{
			Prefix: s.prefix,
			Type:   pb.LockType_Lock,
		}); err != nil {
			log.Warn("could not lock", zap.String("prefix", s.prefix))
		}
	}
}

func (s *remoteLock) Unlock() {
	if s.stream != nil {
		if err := s.stream.Send(&pb.NewLockerRequest{
			Prefix: s.prefix,
			Type:   pb.LockType_Unlock,
		}); err != nil {
			log.Warn("could not unlock", zap.String("prefix", s.prefix))
		}
	}
}

func (r *remote) Watch(opts ...configx.WatchOption) (configx.Receiver, error) {
	o := &configx.WatchOptions{}
	for _, opt := range opts {
		opt(o)
	}

	rcvr := &receiver{
		exit:    make(chan bool),
		path:    o.Path,
		value:   r.Val(o.Path...).Bytes(),
		updates: make(chan []byte),
	}

	r.internalLocker.Lock()
	r.watchers = append(r.watchers, rcvr)
	r.internalLocker.Unlock()

	return rcvr, nil
}

type receiver struct {
	exit    chan bool
	path    []string
	value   []byte
	updates chan []byte
}

func (r *receiver) Next() (interface{}, error) {
	for {
		select {
		case <-r.exit:
			return nil, errors.New("watcher stopped")
		case v := <-r.updates:
			if len(r.value) == 0 && len(v) == 0 {
				continue
			}

			if bytes.Equal(r.value, v) {
				continue
			}

			r.value = v

			ret := configx.New(configx.WithJSON())
			if err := ret.Set(v); err != nil {
				return nil, err
			}
			return ret, nil
		}
	}
}

func (r *receiver) Stop() {
	select {
	case <-r.exit:
	default:
		close(r.exit)
	}
}

type values struct {
	ctx context.Context
	cli pb.ConfigClient
	id  string
	k   []string
	d   any
}

func (v *values) Walk(f func(i int, v any) any) error {
	return nil
}

func (v *values) Context(ctx context.Context) configx.Values {
	return configx.New(configx.WithStorer(&values{ctx: ctx, cli: v.cli, id: v.id, k: v.k, d: v.d}))
}

func (v *values) Default(data any) configx.Values {
	return configx.New(configx.WithStorer(&values{ctx: v.ctx, cli: v.cli, id: v.id, k: v.k, d: data}))
}

func (v *values) Options() *configx.Options {
	c := configx.New(configx.WithJSON())
	return c.Options()
}

func (v *values) Key() []string {
	return v.k
}

func (v *values) Val(path ...string) configx.Values {
	return configx.New(configx.WithStorer(&values{ctx: v.ctx, cli: v.cli, id: v.id, k: configx.StringToKeys(append(v.k, path...)...), d: v.d}))
}

func (v *values) Get(wo ...configx.WalkOption) any {
	c := configx.New(configx.WithJSON())

	rsp, err := v.cli.Get(v.ctx, &pb.GetRequest{
		Namespace: v.id,
		Path:      strings.Join(v.k, "/"),
	})

	if err != nil {
		if !errors.Is(err, context.Canceled) {
			log.Logger(v.ctx).Warn("Config error (fork cannot contact remote gRPC service", zap.Error(err))
		}
		return nil
	}

	if err = c.Set(rsp.GetValue().GetData()); err != nil {
		log.Logger(v.ctx).Error("Remote config error (could not set value from data ", zap.Error(err))
		return nil
	}

	vv := c.Get()
	if vv == nil {
		return v.d
	}

	return vv
}

func (v *values) Set(value interface{}) error {
	b, err := json.Marshal(value)
	if err != nil {
		return err
	}

	if _, err = v.cli.Set(v.ctx, &pb.SetRequest{
		Namespace: v.id,
		Path:      strings.Join(v.k, "/"),
		Value:     &pb.Value{Data: b},
	}); err != nil {
		return err
	}

	return nil
}

func (v *values) Del() error {
	if _, err := v.cli.Delete(v.ctx, &pb.DeleteRequest{
		Namespace: v.id,
		Path:      strings.Join(v.k, "/"),
	}); err != nil {
		return err
	}

	return nil
}
