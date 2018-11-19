/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"time"

	proto "github.com/pydio/config-srv/proto/config"
	"github.com/pydio/go-os/config"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
)

type remotesource struct {
	opts config.SourceOptions
}

func (s *remotesource) Read() (*config.ChangeSet, error) {
	cli := proto.NewConfigClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_CONFIG, defaults.NewClient())
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	rsp, err := cli.Read(ctx, &proto.ReadRequest{})
	if err != nil {
		return nil, err
	}
	return &config.ChangeSet{
		Timestamp: time.Unix(rsp.Change.ChangeSet.Timestamp, 0),
		Data:      []byte(rsp.Change.ChangeSet.Data),
		Checksum:  rsp.Change.ChangeSet.Checksum,
		Source:    rsp.Change.ChangeSet.Source,
	}, nil
}

func (s *remotesource) String() string {
	return "pydio"
}

func (s *remotesource) Watch() (config.SourceWatcher, error) {
	cli := proto.NewConfigClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_CONFIG, defaults.NewClient())
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

// FIXME simply copied from pydio/go-os/config/watcher.go
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
