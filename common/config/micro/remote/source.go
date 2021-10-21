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

// Package source implements a configuration client backed by a config server
package remote

import (
	"context"
	"crypto/md5"
	"fmt"
	"strings"
	"time"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	proto "github.com/pydio/config-srv/proto/config"
	"github.com/pydio/go-os/config"

	go_micro_os_config "github.com/pydio/go-os/config/proto"
)

type remotesource struct {
	opts config.SourceOptions
}

func (s *remotesource) Read() (*config.ChangeSet, error) {

	var changeset *config.ChangeSet

	err := Retry(func() error {
		cli := proto.NewConfigClient(common.ServiceGrpcNamespace_+common.ServiceConfig, defaults.NewClient())

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		rsp, err := cli.Read(ctx, &proto.ReadRequest{
			Id: s.opts.Name,
		})

		if err != nil {
			return err
		}

		changeset = &config.ChangeSet{
			Timestamp: time.Unix(rsp.Change.ChangeSet.Timestamp, 0),
			Data:      []byte(rsp.Change.ChangeSet.Data),
			Checksum:  rsp.Change.ChangeSet.Checksum,
			Source:    rsp.Change.ChangeSet.Source,
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return changeset, nil
}

func (s *remotesource) String() string {
	return "pydio"
}

func (s *remotesource) Watch() (config.SourceWatcher, error) {
	cli := proto.NewConfigClient(common.ServiceGrpcNamespace_+common.ServiceConfig, nil)
	stream, err := cli.Watch(context.Background(), &proto.WatchRequest{
		Id: s.opts.Name,
	})
	if err != nil {
		return nil, err
	}
	sw := sourceWatcher{stream}
	return &sw, nil
}

func NewSource(opts ...config.SourceOption) config.Source {
	var options config.SourceOptions
	for _, o := range opts {
		o(&options)
	}

	if len(options.Name) == 0 {
		options.Name = config.DefaultSourceName
	}

	return &remotesource{
		opts: options,
	}
}

type sourceWatcher struct {
	w proto.Config_WatchClient
}

func (w *sourceWatcher) Next() (*config.ChangeSet, error) {
	c, err := w.w.Recv()
	if err != nil {
		return nil, err
	}
	return &config.ChangeSet{
		Timestamp: time.Unix(c.ChangeSet.Timestamp, 0),
		Data:      []byte(c.ChangeSet.Data),
		Checksum:  c.ChangeSet.Checksum,
		Source:    c.ChangeSet.Source,
	}, nil
}

func (w *sourceWatcher) Stop() error {
	return w.w.Close()
}

// UpdateRemote sends an Update request to a remote Config Service
func UpdateRemote(configId string, val interface{}, path ...string) error {

	cl := proto.NewConfigClient(common.ServiceGrpcNamespace_+common.ServiceConfig, defaults.NewClient())
	data, _ := json.Marshal(val)
	hasher := md5.New()
	hasher.Write(data)
	checksum := fmt.Sprintf("%x", hasher.Sum(nil))

	_, e := cl.Update(context.Background(), &proto.UpdateRequest{
		Change: &proto.Change{
			Id:        configId,
			Path:      strings.Join(path, "/"),
			Timestamp: time.Now().Unix(),
			Author:    common.PydioSystemUsername,
			ChangeSet: &go_micro_os_config.ChangeSet{
				Data:      string(data),
				Checksum:  checksum,
				Timestamp: time.Now().Unix(),
			},
		},
	})

	return e
}

// DeleteRemote sends an Delete request to a remote Config Service
func DeleteRemote(configId string, path ...string) error {
	cl := proto.NewConfigClient(common.ServiceGrpcNamespace_+common.ServiceConfig, nil)

	_, e := cl.Delete(context.Background(), &proto.DeleteRequest{
		Change: &proto.Change{
			Id:   configId,
			Path: strings.Join(path, "/"),
		},
	})

	return e
}

func Retry(f func() error, seconds ...time.Duration) error {

	tick := time.Tick(1 * time.Second)
	timeout := time.After(30 * time.Second)
	if len(seconds) == 2 {
		tick = time.Tick(seconds[0])
		timeout = time.After(seconds[1])
	} else if len(seconds) == 1 {
		tick = time.Tick(seconds[0])
	}

	for {
		select {
		case <-tick:
			if err := f(); err == nil {
				return nil
			}
		case <-timeout:
			return fmt.Errorf("timeout")
		}
	}
}
