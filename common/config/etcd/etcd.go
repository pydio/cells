// +build ignore

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
	"fmt"

	"github.com/pydio/cells/x/configx"
	"go.etcd.io/etcd/clientv3"
)

type etcd struct {
	clientv3.Config
}

func NewSource(config clientv3.Config) configx.KVStore {
	return &etcd{
		Config: config,
	}
}

func (m *etcd) Get() configx.Value {
	v := configx.New()

	cli, err := clientv3.New(m.Config)
	if err != nil {
		return v
	}
	defer cli.Close()

	resp, _ := cli.Get(context.Background(), "")
	fmt.Println(resp)

	return v
}

func (m *etcd) Set(data interface{}) error {
	cli, err := clientv3.New(m.Config)
	if err != nil {
		return err
	}
	defer cli.Close()

	resp, err := cli.Put(context.Background(), "", data.(string))
	if err != nil {
		return err
	}

	fmt.Println(resp)

	return nil
}

func (m *etcd) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *etcd) Watch(path ...string) (configx.Receiver, error) {
	// For the moment do nothing
	return &receiver{}, nil
}

type receiver struct{}

func (*receiver) Next() (configx.Values, error) {
	select {}

	return nil, nil
}

func (*receiver) Stop() {
}
