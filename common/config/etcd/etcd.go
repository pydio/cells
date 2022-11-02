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
	"crypto/tls"
	"errors"
	"fmt"
	"go.etcd.io/etcd/client/v3/concurrency"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/r3labs/diff/v3"
	"go.etcd.io/etcd/api/v3/mvccpb"
	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	scheme           = "etcd"
	errClosedChannel = errors.New("channel is closed")
)

type URLOpener struct {
	tlsConfig *tls.Config
}
type TLSURLOpener struct{}

func init() {
	config.DefaultURLMux().Register(scheme, &URLOpener{})
	config.DefaultURLMux().Register(scheme+"+tls", &TLSURLOpener{})
}

func (o *TLSURLOpener) OpenURL(ctx context.Context, u *url.URL) (config.Store, error) {
	if tlsConfig, er := crypto.TLSConfigFromURL(u); er == nil {
		return (&URLOpener{tlsConfig}).OpenURL(ctx, u)
	} else {
		return nil, fmt.Errorf("error while loading tls config for etcd %v", er)
	}
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (config.Store, error) {
	addr := "://" + u.Host
	if o.tlsConfig == nil {
		addr = "http" + addr
	} else {
		addr = "https" + addr
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

	sessionTTL := -1
	if u.Query().Has("ttl") {
		if s, err := strconv.Atoi(u.Query().Get("ttl")); err != nil {
			return nil, errors.New("not a valid time to live")
		} else {
			sessionTTL = s
		}
	}

	// TODO - without keys should be done with a wrapper - considering withKeys = true always
	withKeys := u.Query().Get("withKeys") == "true"

	// Registry via etcd
	pwd, _ := u.User.Password()

	etcdConn, err := clientv3.New(clientv3.Config{
		Endpoints:   []string{addr},
		DialTimeout: 2 * time.Second,
		Username:    u.User.Username(),
		Password:    pwd,
		TLS:         o.tlsConfig,
	})

	if err != nil {
		return nil, err
	}

	return NewSource(context.Background(), etcdConn, strings.TrimLeft(u.Path, "/"), sessionTTL, withKeys, opts...)
}

type etcd struct {
	ctx          context.Context
	values       configx.Values
	valuesLocker *sync.RWMutex
	ops          chan clientv3.Op

	prefix   string
	withKeys bool
	cli      *clientv3.Client
	session  *concurrency.Session
	leaseID  clientv3.LeaseID

	locker    sync.Locker
	receivers []*receiver
	reset     chan bool
	opts      []configx.Option

	saveCh    chan bool
	saveTimer *time.Timer
}

func NewSource(ctx context.Context, cli *clientv3.Client, prefix string, sessionTTL int, withKeys bool, opts ...configx.Option) (config.Store, error) {
	opts = append([]configx.Option{configx.WithJSON()}, opts...)

	var session *concurrency.Session
	var leaseID clientv3.LeaseID

	if sessionTTL > -1 {
		if s, err := concurrency.NewSession(cli, concurrency.WithTTL(sessionTTL)); err != nil {
			return nil, err
		} else {
			session = s
			leaseID = s.Lease()
		}
	}

	m := &etcd{
		ctx:          ctx,
		values:       configx.New(opts...),
		valuesLocker: &sync.RWMutex{},
		ops:          make(chan clientv3.Op, 3000),
		cli:          cli,
		session:      session,
		leaseID:      leaseID,
		prefix:       prefix,
		withKeys:     withKeys,
		locker:       &sync.Mutex{},
		reset:        make(chan bool),
		opts:         opts,
		saveCh:       make(chan bool),
		saveTimer:    time.NewTimer(100 * time.Millisecond),
	}

	m.get(ctx)

	go m.watch(ctx)
	go m.save(ctx)

	return m, nil
}

func (m *etcd) get(ctx context.Context) {
	res, err := m.cli.Get(ctx, m.prefix, clientv3.WithPrefix())
	if err != nil {
		return
	}

	for _, op := range res.Kvs {
		key := strings.TrimPrefix(string(op.Key), m.prefix)
		key = strings.TrimPrefix(key, "/")
		if err := m.values.Val(key).Set(op.Value); err != nil {
			fmt.Println("Error in etcd watch setting value for key ", op.Key)
		}
	}
}

func (m *etcd) watch(ctx context.Context) {
	watcher := m.cli.Watch(ctx, m.prefix, clientv3.WithPrefix(), clientv3.WithPrevKV())
	for {
		select {
		case res, ok := <-watcher:
			if !ok {
				return
			}

			for _, op := range res.Events {
				key := strings.TrimPrefix(string(op.Kv.Key), m.prefix)
				key = strings.TrimPrefix(key, "/")

				if err := m.values.Val(key).Set(op.Kv.Value); err != nil {
					fmt.Println("Error in etcd watch setting value for key ", op.Kv.Key)
				}

				var ops []*clientv3.Event
				if !m.withKeys {
					if op.PrevKv == nil {
						continue
					}
					prev := configx.New(m.opts...)
					neu := configx.New(m.opts...)

					prev.Set(op.PrevKv.Value)
					neu.Set(op.Kv.Value)

					patch, err := diff.Diff(prev.Interface(), neu.Interface())
					if err != nil {
						continue
					}

					// Sending all patches diff as events
					for _, p := range patch {
						typ := clientv3.EventTypePut
						if p.Type == diff.DELETE {
							typ = clientv3.EventTypeDelete
						}

						ops = append(ops, &clientv3.Event{
							Type: typ,
							Kv: &mvccpb.KeyValue{
								Key:            []byte(strings.Join(p.Path, "/")),
								Value:          neu.Val(p.Path...).Bytes(),
								CreateRevision: op.Kv.CreateRevision,
								ModRevision:    op.Kv.ModRevision,
							},
							PrevKv: &mvccpb.KeyValue{
								Key:            []byte(strings.Join(p.Path, "/")),
								Value:          prev.Val(p.Path...).Bytes(),
								CreateRevision: op.PrevKv.CreateRevision,
								ModRevision:    op.PrevKv.ModRevision,
							},
						})
					}
				} else {
					ops = append(ops, op)
				}

				for _, op := range ops {
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
}

func (m *etcd) Get() configx.Value {
	m.valuesLocker.RLock()
	defer m.valuesLocker.RUnlock()

	return m.values
}

func (m *etcd) Val(path ...string) configx.Values {
	return &values{values: m.values, valuesLocker: m.valuesLocker, withKeys: m.withKeys, ops: m.ops, prefix: m.prefix, path: strings.Join(path, "/"), leaseID: m.leaseID, opts: m.opts}
}

func (m *etcd) Set(data interface{}) error {
	m.valuesLocker.Lock()
	defer m.valuesLocker.Unlock()

	if err := m.values.Set(data); err != nil {
		return err
	}

	m.ops <- clientv3.OpPut(m.prefix, string(m.values.Bytes()), clientv3.WithLease(m.leaseID))

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

func (m *etcd) Close() error {
	if m.session != nil {
		return m.session.Close()
	}

	return nil
}

func (m *etcd) Done() <-chan struct{} {
	if m.session != nil {
		return m.session.Done()
	}

	return nil
}

func (m *etcd) Save(ctxUser string, ctxMessage string) error {
	select {
	case m.saveCh <- true:
	case <-m.ctx.Done():
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

	r := &receiver{
		closed:      false,
		prefix:      m.prefix,
		ch:          make(chan *clientv3.Event),
		path:        o.Path,
		changesOnly: o.ChangesOnly,
		opts:        m.opts,
		v:           m.values,
		timer:       time.NewTimer(2 * time.Second),
	}

	m.receivers = append(m.receivers, r)

	return r, nil
}

type receiver struct {
	closed      bool
	prefix      string
	path        []string
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

	if len(r.path) == 0 {
		r.ch <- ev
	}

	if strings.HasPrefix(string(ev.Kv.Key), strings.Join(r.path, "/")) {
		r.ch <- ev
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
			// Initial timer will trigger so checking we have changes
			if len(changes) == 0 {
				continue
			}
			if r.changesOnly {
				c := configx.New(r.opts...)

				for _, op := range changes {
					if op.IsCreate() {
						if err := c.Val("create").Val(strings.TrimPrefix(string(op.Kv.Key), r.prefix+"/")).Set(op.Kv.Value); err != nil {
							return nil, err
						}
					} else if op.IsModify() {
						if err := c.Val("update").Val(strings.TrimPrefix(string(op.Kv.Key), r.prefix+"/")).Set(op.Kv.Value); err != nil {
							return nil, err
						}
					} else {
						if err := c.Val("delete").Val(strings.TrimPrefix(string(op.Kv.Key), r.prefix+"/")).Set(op.PrevKv.Value); err != nil {
							return nil, err
						}
					}

				}

				return c, nil
			}

			return r.v.Val(r.path...), nil
		}
	}
}

func (r *receiver) Stop() {
	r.closed = true
	close(r.ch)
}

type values struct {
	values       configx.Values
	valuesLocker *sync.RWMutex
	ops          chan clientv3.Op
	leaseID      clientv3.LeaseID
	withKeys     bool

	prefix string
	path   string
	opts   []configx.Option
}

func (v *values) Set(value interface{}) error {
	v.valuesLocker.Lock()
	defer v.valuesLocker.Unlock()

	c := v.values.Val(v.path)
	if err := c.Set(value); err != nil {
		return err
	}

	if v.withKeys {
		v.ops <- clientv3.OpPut(strings.Join([]string{v.prefix, v.path}, "/"), string(c.Bytes()), clientv3.WithLease(v.leaseID))
	} else {
		v.ops <- clientv3.OpPut(v.prefix, string(v.values.Bytes()), clientv3.WithLease(v.leaseID))
	}
	return nil
}

func (v *values) Get() configx.Value {
	v.valuesLocker.RLock()
	defer v.valuesLocker.RUnlock()

	return v.values.Val(v.path)
}

func (v *values) Del() error {
	v.valuesLocker.Lock()
	defer v.valuesLocker.Unlock()

	if err := v.values.Val(v.path).Del(); err != nil {
		return err
	}

	if v.withKeys {
		v.ops <- clientv3.OpDelete(strings.Join([]string{v.prefix, v.path}, "/"))
	} else {
		v.ops <- clientv3.OpPut(v.prefix, string(v.values.Bytes()), clientv3.WithLease(v.leaseID))
	}
	return nil
}

func (v *values) Val(path ...string) configx.Values {
	if v.path != "" {
		path = append([]string{v.path}, path...)
	}
	return &values{values: v.values, valuesLocker: v.valuesLocker, withKeys: v.withKeys, ops: v.ops, prefix: v.prefix, path: strings.Join(path, "/"), leaseID: v.leaseID, opts: v.opts}
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
