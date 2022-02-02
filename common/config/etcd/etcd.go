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
	"bytes"
	"context"
	"errors"
	"fmt"

	"github.com/pydio/cells/v4/common/config"

	clientv3 "go.etcd.io/etcd/client/v3"

	configx "github.com/pydio/cells/v4/common/utils/configx"
)

var errClosedChannel = errors.New("channel is closed")

type etcd struct {
	v configx.Values

	path string
	cli  *clientv3.Client

	receivers []*receiver
}

func NewSource(ctx context.Context, cli *clientv3.Client, path string, opts ...configx.Option) config.Store {
	opts = append([]configx.Option{configx.WithJSON()}, opts...)

	v := configx.New(opts...)

	resp, _ := cli.Get(context.Background(), path, clientv3.WithLimit(1))

	for _, kv := range resp.Kvs {
		if err := v.Set(kv.Value); err != nil {
			fmt.Println("Error setting the value ", err)
		}
	}

	m := &etcd{
		v:    v,
		cli:  cli,
		path: path,
	}

	go m.watch(ctx)

	return m
}

func (m *etcd) watch(ctx context.Context) {
	watcher := m.cli.Watch(ctx, m.path)

	for {
		select {
		case resp, ok := <-watcher:
			if !ok {
				return
			}
			for _, ev := range resp.Events {
				if err := m.v.Set(ev.Kv.Value); err != nil {
					fmt.Println("Error setting the value here ", err)
					continue
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
}

func (m *etcd) Get() configx.Value {
	return m.v
}

func (m *etcd) Val(path ...string) configx.Values {
	return m.v.Val(path...) // &values{Values: m.v, rootPath: m.path, path: path, cli: m.cli}
}

func (m *etcd) Set(data interface{}) error {
	return m.v.Set(data)
}

func (m *etcd) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *etcd) Save(ctxUser string, ctxMessage string) error {
	_, err := m.cli.Put(context.Background(), m.path, string(m.v.Bytes()))
	if err != nil {
		return err
	}

	return nil
}

func (m *etcd) Watch(path ...string) (configx.Receiver, error) {
	r := &receiver{
		closed: false,
		ch:     make(chan struct{}),
		p:      path,
		v:      m.v.Val(path...),
	}

	m.receivers = append(m.receivers, r)

	// For the moment do nothing
	return r, nil
}

type receiver struct {
	closed bool
	ch     chan struct{}
	p      []string
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
		v := r.v.Val(r.p...)
		if bytes.Compare(v.Bytes(), r.v.Bytes()) != 0 {
			r.v = v
			return v, nil
		}
	}

	return nil, fmt.Errorf("could not retrieve data")
}

func (r *receiver) Stop() {
	r.closed = true
	close(r.ch)
}

//type values struct {
//	cli *clientv3.Client
//
//	configx.Values
//	rootPath string
//	path     []string
//}
//
//func (v *values) Set(data interface{}) error {
//	if err := v.Values.Val(v.path...).Set(data); err != nil {
//		return err
//	}
//
//	_, err := v.cli.Put(context.Background(), v.rootPath, v.Values.Val("#").String())
//	if err != nil {
//		return err
//	}
//
//	return nil
//}
