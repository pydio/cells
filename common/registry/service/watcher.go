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
	"errors"

	"github.com/pydio/cells/v4/common/registry/util"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

type serviceWatcher struct {
	stream pb.Registry_WatchClient
	closed chan bool
}

type result struct {
	action string
	item   registry.Item
}

func (r *result) Action() string {
	return r.action
}

func (r *result) Item() registry.Item {
	return r.item
}

func (s *serviceWatcher) Next() (registry.Result, error) {
	// check if closed
	select {
	case <-s.closed:
		return nil, errors.New("watcher stopped")
	default:
	}

	r, err := s.stream.Recv()
	if err != nil {
		return nil, err
	}

	var items []registry.Item
	for _, i := range r.Items {
		items = append(items, util.ToItem(i))
	}
	return registry.NewResult(r.Action, items), nil
}

func (s *serviceWatcher) Stop() {
	select {
	case <-s.closed:
		return
	default:
		close(s.closed)
		s.stream.CloseSend()
	}
}

func newWatcher(stream pb.Registry_WatchClient) registry.Watcher {
	return &serviceWatcher{
		stream: stream,
		closed: make(chan bool),
	}
}
