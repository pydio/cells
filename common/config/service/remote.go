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
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"

	cgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	pb "github.com/pydio/cells/v4/common/proto/config"
	"github.com/pydio/cells/v4/common/runtime"
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

	var conn grpc.ClientConnInterface

	if conn = runtime.GetClientConn(ctx); conn == nil {
		addr := u.String()
		switch u.Scheme {
		case "grpc":
			addr = u.Host
		}

		c, err := grpc.Dial(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
		if err != nil {
			return nil, err
		}

		conn = c
	}

	conn = cgrpc.NewClientConn("pydio.grpc.config", runtime.Cluster(), cgrpc.WithClientConn(conn))

	store := New(context.Background(), conn, u.Query().Get("namespace"), "/")

	return store, nil
}

type remote struct {
	ctx            context.Context
	cli            pb.ConfigClient
	id             string
	path           []string
	internalLocker *sync.RWMutex
	externalLocker *sync.RWMutex
	watchers       []*receiver
}

func New(ctx context.Context, conn grpc.ClientConnInterface, id string, path string) config.Store {
	r := &remote{
		ctx:            ctx,
		cli:            pb.NewConfigClient(conn),
		id:             id,
		path:           strings.Split(path, "/"),
		internalLocker: &sync.RWMutex{},
		externalLocker: &sync.RWMutex{},
	}

	go func() {
		for {
			stream, err := r.cli.Watch(r.ctx, &pb.WatchRequest{
				Namespace: id,
				Path:      path,
			})

			if err != nil {
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
				c.Set(rsp.GetValue().GetData())

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

			stream.CloseSend()
		}
	}()

	return r
}

func (r *remote) Val(path ...string) configx.Values {
	return &values{
		ctx:  r.ctx,
		cli:  r.cli,
		id:   r.id,
		path: append(r.path, path...),
	}
}

func (r *remote) Get() configx.Value {
	v := configx.New(configx.WithJSON())

	rsp, err := r.cli.Get(r.ctx, &pb.GetRequest{
		Namespace: r.id,
		Path:      strings.Join(r.path, "/"),
	})

	if err != nil {
		return v
	}

	if err := v.Set(rsp.GetValue().GetData()); err != nil {
		fmt.Println("And the error there is ? ", err)
	}

	return v
}

func (r *remote) Set(value interface{}) error {
	b, err := json.Marshal(value)
	if err != nil {
		return err
	}

	if _, err := r.cli.Set(r.ctx, &pb.SetRequest{
		Namespace: r.id,
		Path:      strings.Join(r.path, "/"),
		Value:     &pb.Value{Data: b},
	}); err != nil {
		return err
	}

	return nil
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
	ctx  context.Context
	cli  pb.ConfigClient
	id   string
	path []string
}

func (v *values) Val(path ...string) configx.Values {
	return &values{
		ctx:  v.ctx,
		cli:  v.cli,
		id:   v.id,
		path: append(v.path, path...),
	}
}

func (v *values) Get() configx.Value {
	c := configx.New(configx.WithJSON())

	rsp, err := v.cli.Get(v.ctx, &pb.GetRequest{
		Namespace: v.id,
		Path:      strings.Join(v.path, "/"),
	})

	if err != nil {
		fmt.Println("Config error (fork cannot contact remote gRPC service: ", err.Error(), ")")
		return c
	}

	if err := c.Set(rsp.GetValue().GetData()); err != nil {
		//fmt.Println("And the error is ? ", err)
	}

	return c.Get()
}

func (v *values) Clone() configx.Value {
	c := configx.New(configx.WithJSON())

	rsp, err := v.cli.Get(v.ctx, &pb.GetRequest{
		Namespace: v.id,
		Path:      strings.Join(v.path, "/"),
	})

	if err != nil {
		fmt.Println("Config error (fork cannot contact remote gRPC service: ", err.Error(), ")")
		return c
	}

	if err := c.Set(rsp.GetValue().GetData()); err != nil {
		//fmt.Println("And the error is ? ", err)
	}

	return c.Get()
}

func (v *values) Set(value interface{}) error {
	b, err := json.Marshal(value)
	if err != nil {
		return err
	}

	if _, err := v.cli.Set(v.ctx, &pb.SetRequest{
		Namespace: v.id,
		Path:      strings.Join(v.path, "/"),
		Value:     &pb.Value{Data: b},
	}); err != nil {
		return err
	}

	return nil
}

func (v *values) Del() error {
	if _, err := v.cli.Delete(v.ctx, &pb.DeleteRequest{
		Namespace: v.id,
		Path:      strings.Join(v.path, "/"),
	}); err != nil {
		return err
	}

	return nil
}

func (v *values) Default(i interface{}) configx.Value {
	if vv, ok := configx.GetReference(i); ok {
		i = (&values{
			ctx:  v.ctx,
			cli:  v.cli,
			id:   v.id,
			path: configx.StringToKeys(vv.Get()),
		}).Get()
	}

	return v.Get().Default(i)
}

func (v *values) Bool() bool {
	return v.Get().Bool()
}

func (v *values) Bytes() []byte {
	return v.Get().Bytes()
}

func (v *values) Key() []string {
	return v.Get().Key()
}

func (v *values) Reference() configx.Ref {
	return v.Get().Reference()
}

func (v *values) Interface() interface{} {
	return v.Get().Interface()
}

func (v *values) Int() int {
	return v.Get().Int()
}

func (v *values) Int64() int64 {
	return v.Get().Int64()
}

func (v *values) Duration() time.Duration {
	return v.Get().Duration()
}

func (v *values) String() string {
	return v.Get().String()
}

func (v *values) StringMap() map[string]string {
	return v.Get().StringMap()
}

func (v *values) StringArray() []string {
	return v.Get().StringArray()
}

func (v *values) Slice() []interface{} {
	return v.Get().Slice()
}

func (v *values) Map() map[string]interface{} {
	return v.Get().Map()
}

func (v *values) Scan(i interface{}, opts ...configx.Option) error {
	return v.Get().Scan(i, opts...)
}
