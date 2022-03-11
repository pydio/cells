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

	// Registry via etcd
	etcdConn, err := clientv3.New(clientv3.Config{
		Endpoints:   []string{addr},
		DialTimeout: 2 * time.Second,
	})

	if err != nil {
		return nil, err
	}

	store := NewSource(context.Background(), etcdConn, u.Path, true, opts...)

	return store, nil
}

type etcd struct {
	prefix    string
	cli       *clientv3.Client
	leaseID   clientv3.LeaseID
	locker    sync.Locker
	receivers []*receiver
	opts      []configx.Option
}

func NewSource(ctx context.Context, cli *clientv3.Client, prefix string, withLease bool, opts ...configx.Option) config.Store {
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
		cli:     cli,
		prefix:  prefix,
		locker:  &sync.Mutex{},
		leaseID: leaseID,
		opts:    opts,
	}

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

func (m *etcd) Get() configx.Value {
	v := configx.New(m.opts...)

	resp, err := m.cli.Get(context.Background(), m.prefix, clientv3.WithPrefix(), clientv3.WithLease(m.leaseID))
	if err != nil {
		fmt.Println("Error is ", err)
		return nil
	}

	for _, kv := range resp.Kvs {
		if err := v.Val(string(kv.Key)).Set(kv.Value); err != nil {
			fmt.Println("Error setting string ", err)
		}
	}

	return v.Val(m.prefix)
}

func (m *etcd) Val(path ...string) configx.Values {
	return &values{prefix: m.prefix, cli: m.cli, leaseID: m.leaseID, path: strings.Join(path, "/"), opts: m.opts}
}

func (m *etcd) Set(data interface{}) error {
	v := configx.New(m.opts...)
	if err := v.Set(data); err != nil {
		return err
	}

	configx.Walk(v, func(key []string, val configx.Value) error {
		_, err := m.cli.Put(context.Background(), strings.Join(append([]string{m.prefix}, key...), "/"), string(val.Bytes()), clientv3.WithLease(m.leaseID))
		if err != nil {
			return err
		}

		return nil
	})

	return nil
}

func (m *etcd) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *etcd) Save(ctxUser string, ctxMessage string) error {
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
	prefix  string
	path    string
	cli     *clientv3.Client
	leaseID clientv3.LeaseID
	opts    []configx.Option
}

func (v *values) Set(value interface{}) error {
	c := configx.New(v.opts...)
	if err := c.Set(value); err != nil {
		return err
	}

	configx.Walk(c, func(key []string, val configx.Value) error {
		if v.path != "" {
			key = append([]string{v.path}, key...)
		}
		if v.prefix != "" {
			key = append([]string{v.prefix}, key...)
		}
		_, err := v.cli.Put(context.Background(), strings.Join(key, "/"), string(val.Bytes()), clientv3.WithLease(v.leaseID))
		if err != nil {
			return err
		}
		return nil
	})

	return nil
}

func (v *values) Get() configx.Value {
	c := configx.New(v.opts...)

	resp, err := v.cli.Get(context.Background(), v.prefix+"/"+v.path, clientv3.WithPrefix(), clientv3.WithLease(v.leaseID))
	if err != nil {
		fmt.Println("Error is ", err)
		return nil
	}

	for _, kv := range resp.Kvs {
		if err := c.Val(strings.TrimLeft(string(kv.Key), v.prefix+"/"+v.path)).Set(kv.Value); err != nil {
			fmt.Println("Error setting string ", err)
		}
	}

	return c
}

func (v *values) Del() error {
	_, err := v.cli.Delete(context.Background(), v.prefix+"/"+v.path, clientv3.WithPrefix())
	if err != nil {
		fmt.Println("Del error is ", err)
		return err
	}

	return nil
}

func (v *values) Val(path ...string) configx.Values {
	if v.path != "" {
		path = append([]string{v.path}, path...)
	}
	return &values{prefix: v.prefix, path: strings.Join(path, "/"), cli: v.cli, leaseID: v.leaseID, opts: v.opts}
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
