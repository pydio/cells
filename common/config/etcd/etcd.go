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

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/utils/configx"

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
	default:
		opts = append(opts, configx.WithJSON())
	}

	if master := u.Query().Get("masterKey"); master != "" {
		enc, err := crypto.NewVaultCipher(master)
		if err != nil {
			return nil, err
		}
		opts = append(opts, configx.WithEncrypt(enc), configx.WithDecrypt(enc))
	}

	withLease := u.Query().Get("lease") == "true"
	withKeys := u.Query().Get("withKeys") == "true"

	// Registry via etcd
	etcdConn, err := clientv3.New(clientv3.Config{
		Endpoints:   []string{addr},
		DialTimeout: 2 * time.Second,
	})

	if err != nil {
		return nil, err
	}

	store := NewSource(context.Background(), etcdConn, strings.TrimLeft(u.Path, "/"), withLease, withKeys, opts...)

	return store, nil
}

type etcd struct {
	committed   configx.Values
	uncommitted configx.Values
	ops         chan clientv3.Op

	prefix    string
	withKeys  bool
	cli       *clientv3.Client
	leaseID   clientv3.LeaseID
	locker    sync.Locker
	receivers []*receiver
	reset     chan bool
	opts      []configx.Option

	saveCh    chan bool
	saveTimer *time.Timer
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
				return
			}

			for resp := range ch {
				_ = resp
			}
		}()
	}

	m := &etcd{
		committed:   configx.New(opts...),
		uncommitted: configx.New(opts...),
		ops:         make(chan clientv3.Op, 3000),
		cli:         cli,
		prefix:      prefix,
		withKeys:    withKeys,
		locker:      &sync.Mutex{},
		leaseID:     leaseID,
		reset:       make(chan bool),
		opts:        opts,
		saveCh:      make(chan bool),
		saveTimer:   time.NewTimer(100 * time.Millisecond),
	}

	m.get(ctx)
	go m.watch(ctx)
	go m.save(ctx)

	return m
}

func (m *etcd) get(ctx context.Context) {
	res, err := m.cli.Get(ctx, m.prefix, clientv3.WithPrefix())
	if err != nil {
		return
	}

	for _, op := range res.Kvs {
		key := strings.TrimPrefix(string(op.Key), m.prefix)
		key = strings.TrimPrefix(key, "/")
		if err := m.committed.Val(key).Set(op.Value); err != nil {
			fmt.Println("Error in etcd watch setting value for key ", op.Key)
		}
		if err := m.uncommitted.Val(key).Set(op.Value); err != nil {
			fmt.Println("Error in etcd watch setting value for key ", op.Key)
		}
	}
}

func (m *etcd) watch(ctx context.Context) {
	watcher := m.cli.Watch(ctx, m.prefix, clientv3.WithPrefix())
	for {
		select {
		case res, ok := <-watcher:
			if !ok {
				return
			}

			for _, op := range res.Events {
				key := strings.TrimPrefix(string(op.Kv.Key), m.prefix+"/")
				if err := m.committed.Val(key).Set(op.Kv.Value); err != nil {
					fmt.Println("Error in etcd watch setting value for key ", op.Kv.Key)
				}

				updated := m.receivers[:0]
				for _, r := range m.receivers {
					if err := r.call(op); err == nil {
						updated = append(updated, r)
					}
				}

				m.receivers = updated
			}
		}
	}
}

func (m *etcd) Get() configx.Value {
	return m.committed
}

func (m *etcd) Val(path ...string) configx.Values {
	return &values{committed: m.committed, uncommitted: m.uncommitted, ops: m.ops, prefix: m.prefix, path: strings.Join(path, "/"), leaseID: m.leaseID, opts: m.opts}
}

func (m *etcd) Set(data interface{}) error {
	if err := m.uncommitted.Set(data); err != nil {
		return err
	}

	m.ops <- clientv3.OpPut(m.prefix, string(m.uncommitted.Bytes()), clientv3.WithLease(m.leaseID))

	return nil
}

func (m *etcd) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *etcd) save(ctx context.Context) {
	var ops []clientv3.Op

	batch := 20
	for {
		select {
		case op := <-m.ops:
			ops = append(ops, op)
		case <-m.saveCh:
			m.saveTimer.Reset(100 * time.Millisecond)
		case <-m.saveTimer.C:

			var opsWithoutDuplicates []clientv3.Op

			// First we remove all duplicate keys for transactions
			var keys []string
			var allKeys []string
			for i := len(ops) - 1; i >= 0; i-- {
				found := false

				k := string(ops[i].KeyBytes())

				allKeys = append(allKeys, k)
				for _, key := range keys {
					if k == key {
						found = true
					}
				}

				if !found {
					keys = append(keys, k)
					opsWithoutDuplicates = append(opsWithoutDuplicates, ops[i])
				} else {
				}
			}

			for i := 0; i < len(opsWithoutDuplicates); i += batch {
				j := i + batch
				if j >= len(opsWithoutDuplicates) {
					j = len(opsWithoutDuplicates)
				}

				_, err := m.cli.Txn(ctx).Then(opsWithoutDuplicates[i:j]...).Commit()
				if err != nil {
					fmt.Println("Error in etcd save committing ops", err)
				}
			}

			ops = nil
		case <-ctx.Done():
			return
		}
	}
}

func (m *etcd) Save(ctxUser string, ctxMessage string) error {
	if m.withKeys {
		m.saveCh <- true
	} else {
		if _, err := m.cli.Put(context.Background(), m.prefix, string(m.uncommitted.Bytes()), clientv3.WithLease(m.leaseID)); err != nil {
			return err
		}
	}

	return nil
}

func (m *etcd) Lock() {
	m.locker.Lock()
}

func (m *etcd) Unlock() {
	m.locker.Unlock()
}

func (m *etcd) Watch(opts ...configx.WatchOption) (configx.Receiver, error) {
	o := &configx.WatchOptions{}
	for _, opt := range opts {
		opt(o)
	}
	// path := o.Paths

	r := &receiver{
		closed:      false,
		prefix:      m.prefix,
		ch:          make(chan *clientv3.Event),
		paths:       o.Paths,
		changesOnly: o.ChangesOnly,
		opts:        m.opts,
		v:           m.committed,
		timer:       time.NewTimer(2 * time.Second),
	}

	m.receivers = append(m.receivers, r)

	return r, nil
}

type receiver struct {
	closed      bool
	prefix      string
	paths       [][]string
	ch          chan *clientv3.Event
	v           configx.Values
	timer       *time.Timer
	opts        []configx.Option
	changesOnly bool
}

func (r *receiver) call(ev *clientv3.Event) error {
	if r.closed {
		return errClosedChannel
	}

	if len(r.paths) == 0 {
		r.ch <- ev
	}

	for _, path := range r.paths {
		if strings.Join(path, "") == "" || strings.HasPrefix(strings.Join(path, "/"), string(ev.Kv.Key)) {
			r.ch <- ev
		}
	}

	return nil
}

func (r *receiver) Next() (interface{}, error) {
	changes := []*clientv3.Event{}

	for {
		select {
		case ev := <-r.ch:
			changes = append(changes, ev)

			r.timer.Reset(2 * time.Second)
		case <-r.timer.C:
			if r.changesOnly {
				c := configx.New(r.opts...)

				for _, op := range changes {
					opType := "delete"
					if op.IsCreate() {
						opType = "create"
					} else if op.IsModify() {
						opType = "update"
					}

					if err := c.Val(opType).Val(strings.TrimPrefix(string(op.Kv.Key), r.prefix+"/")).Set(op.Kv.Value); err != nil {
						return nil, err
					}
				}

				return c, nil
			}

			// TODO
			return r.v.Val(r.paths[0]...), nil
		}
	}
}

func (r *receiver) Stop() {
	r.closed = true
	close(r.ch)
}

type values struct {
	committed   configx.Values
	uncommitted configx.Values
	ops         chan clientv3.Op
	leaseID     clientv3.LeaseID

	prefix string
	path   string
	opts   []configx.Option
}

func (v *values) Set(value interface{}) error {
	c := v.uncommitted.Val(v.path)
	if err := c.Set(value); err != nil {
		return err
	}

	v.ops <- clientv3.OpPut(strings.Join([]string{v.prefix, v.path}, "/"), string(c.Bytes()), clientv3.WithLease(v.leaseID))

	return nil
}

func (v *values) Get() configx.Value {
	return v.committed.Val(v.path)
}

func (v *values) Del() error {
	if err := v.uncommitted.Val(v.path).Del(); err != nil {
		return err
	}

	v.ops <- clientv3.OpDelete(strings.Join([]string{v.prefix, v.path}, "/"))
	return nil
}

func (v *values) Val(path ...string) configx.Values {
	if v.path != "" {
		path = append([]string{v.path}, path...)
	}
	return &values{committed: v.committed, uncommitted: v.uncommitted, ops: v.ops, prefix: v.prefix, path: strings.Join(path, "/"), leaseID: v.leaseID, opts: v.opts}
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

func (v *values) Scan(i interface{}, opts ...configx.Option) error {
	return v.Get().Scan(i, opts...)
}
