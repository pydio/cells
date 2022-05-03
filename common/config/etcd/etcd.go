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

package etcd

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/pydio/cells/v4/common/utils/configx"

	"github.com/pydio/cells/v4/common/config"

	clientv3 "go.etcd.io/etcd/client/v3"
)

var (
	scheme           = "etcd"
	errClosedChannel = errors.New("channel is closed")
)

type URLOpener struct{}

func init() {
	o := &URLOpener{}
	config.DefaultURLMux().Register(scheme, o)
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (config.Store, error) {
	tls := u.Query().Get("tls") == "true"
	addr := u.Host
	if tls {
		addr = "https://" + addr
	} else {
		addr = "http://" + addr
	}

	var opts []configx.Option

	encode := u.Query().Get("encode")
	switch encode {
	case "string":
		opts = append(opts, configx.WithString())
	case "yaml":
		opts = append(opts, configx.WithYAML())
	case "json":
		opts = append(opts, configx.WithJSON())
	}

	withKeys := u.Query().Get("withKeys") == "true"

	// Registry via etcd
	etcdConn, err := clientv3.New(clientv3.Config{
		Endpoints:   []string{addr},
		DialTimeout: 2 * time.Second,
	})

	if err != nil {
		return nil, err
	}

	store := NewSource(context.Background(), etcdConn, u.Path, true, withKeys, opts...)

	return store, nil
}

type etcd struct {
	v         configx.Values
	prefix    string
	withKeys  bool
	cli       *clientv3.Client
	leaseID   clientv3.LeaseID
	locker    sync.Locker
	receivers []*receiver
	reset     chan bool
	opts      []configx.Option
}

func NewSource(ctx context.Context, cli *clientv3.Client, prefix string, withLease bool, withKeys bool, opts ...configx.Option) config.Store {
	opts = append([]configx.Option{configx.WithJSON()}, opts...)

	var leaseID clientv3.LeaseID
	if withLease {
		lease := clientv3.NewLease(cli)
		resp, err := lease.Grant(ctx, 10)
		if err != nil {
			log.Fatal(err)
		}

		leaseID = resp.ID

		go func() {
			ch, err := lease.KeepAlive(ctx, leaseID)
			if err != nil {
				fmt.Println("The lease is gone !!!")
				return
			}

			for resp := range ch {
				_ = resp
			}
		}()
	}

	m := &etcd{
		v:        configx.New(opts...),
		cli:      cli,
		prefix:   prefix,
		withKeys: withKeys,
		locker:   &sync.Mutex{},
		leaseID:  leaseID,
		reset:    make(chan bool),
		opts:     opts,
	}

	m.Get()

	go m.watch(ctx)

	return m
}

func (m *etcd) watch(ctx context.Context) {
	watcher := m.cli.Watch(ctx, m.prefix, clientv3.WithPrefix())

	for {
		select {
		case _, ok := <-watcher:
			if !ok {
				fmt.Println("WATCHER IS GONE !!!")
				return
			}

			updated := m.receivers[:0]
			for _, r := range m.receivers {
				if err := r.call(); err == nil {
					updated = append(updated, r)
				}
			}

			m.receivers = updated

		}
	}
}

func (m *etcd) update() {
	select {
	case m.reset <- true:
	default:
	}
}

func (m *etcd) Get() configx.Value {
	if m.withKeys {
		resp, err := m.cli.Get(context.Background(), m.prefix, clientv3.WithLease(m.leaseID), clientv3.WithPrefix())
		if err != nil {
			fmt.Println("Error is ", err)
			return nil
		}

		for _, kv := range resp.Kvs {
			fmt.Println("Setting value ? ", string(kv.Key), string(kv.Value))
			if err := m.v.Set(kv.Value); err != nil {
				fmt.Println("Error here ", string(kv.Value), err)
				return nil
			}
		}
	}

	return m.v
}

func (m *etcd) Val(path ...string) configx.Values {
	return &values{cli: m.cli, leaseID: m.leaseID, withKeys: m.withKeys, root: m.v, prefix: m.prefix, path: strings.Join(path, "/"), opts: m.opts}
}

func (m *etcd) Set(data interface{}) error {
	if err := m.v.Set(data); err != nil {
		return err
	}

	return nil
}

func (m *etcd) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *etcd) Save(ctxUser string, ctxMessage string) error {
	if m.withKeys {
		return nil
	}

	if _, err := m.cli.Put(context.Background(), m.prefix, string(m.v.Bytes()), clientv3.WithLease(m.leaseID)); err != nil {
		return err
	}

	return nil
}

func (m *etcd) Lock() {
	m.locker.Lock()
}

func (m *etcd) Unlock() {
	m.locker.Unlock()
}

func (m *etcd) Watch(path ...string) (configx.Receiver, error) {
	r := &receiver{
		closed: false,
		ch:     make(chan struct{}),
		v:      m.Val(path...),
	}

	m.receivers = append(m.receivers, r)

	return r, nil
}

type receiver struct {
	closed bool
	ch     chan struct{}
	v      configx.Values
}

func (r *receiver) call() error {
	if r.closed {
		return errClosedChannel
	}
	r.ch <- struct{}{}
	return nil
}

func (r *receiver) Next() (configx.Values, error) {
	select {
	case <-r.ch:
		return r.v.Val(), nil
	}

	return r.Next()
}

func (r *receiver) Stop() {
	r.closed = true
	close(r.ch)
}

type values struct {
	cli      *clientv3.Client
	leaseID  clientv3.LeaseID
	withKeys bool
	root     configx.Values
	prefix   string
	path     string
	opts     []configx.Option
}

func (v *values) Set(value interface{}) error {
	if v.withKeys {
		c := configx.New(v.opts...)
		if err := c.Set(value); err != nil {
			return err
		}

		if _, err := v.cli.Put(context.Background(), v.prefix+"/"+v.path, string(c.Bytes()), clientv3.WithLease(v.leaseID)); err != nil {
			return err
		}

		return nil
	}

	return v.root.Val(v.path).Set(value)
}

func (v *values) Get() configx.Value {
	return v.root.Val(v.path)
}

func (v *values) Del() error {
	return v.root.Val(v.path).Del()
}

func (v *values) Val(path ...string) configx.Values {
	if v.path != "" {
		path = append([]string{v.path}, path...)
	}
	return &values{cli: v.cli, leaseID: v.leaseID, withKeys: v.withKeys, root: v.root, prefix: v.prefix, path: strings.Join(path, "/"), opts: v.opts}
}

func (v *values) Default(i interface{}) configx.Value {
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

func (v *values) Scan(i interface{}) error {
	return v.Get().Scan(i)
}
