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
	"io"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
)

type streamWatcher struct {
	stream pb.Registry_WatchClient
	closed chan bool
}

func (s *streamWatcher) Next() (registry.Result, error) {
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
	//fmt.Println("Got NEXT on streamWatcher", r.Action, len(r.Items))
	return registry.NewResult(r.Action, items), nil
}

func (s *streamWatcher) Stop() {
	select {
	case <-s.closed:
		return
	default:
		close(s.closed)
		s.stream.CloseSend()
	}
}

func newStreamWatcher(stream pb.Registry_WatchClient) registry.Watcher {
	return &streamWatcher{
		stream: stream,
		closed: make(chan bool),
	}
}

type chanWatcher struct {
	events  chan registry.Result
	close   chan bool
	closed  bool
	onClose func()
}

func (s *chanWatcher) Next() (registry.Result, error) {
	select {
	case res := <-s.events:
		// fmt.Println("Sending Newt Event on chanWatcher", res.Action(), len(res.Items()))
		return res, nil
	case <-s.close:
		return nil, io.EOF
	}
}

func (s *chanWatcher) Stop() {
	s.closed = true
	s.onClose()
	close(s.close)
	close(s.events)
}

func newChanWatcher(input chan registry.Result, onClose func(), options registry.Options) registry.Watcher {
	cw := &chanWatcher{
		events:  make(chan registry.Result),
		close:   make(chan bool, 1),
		onClose: onClose,
	}
	go func() {
		for res := range input {
			if !cw.closed {

				// fmt.Println("Received Event on chanWatcher", res.Action(), len(res.Items()))
				// Filter by action type
				if options.Action == pb.ActionType_FULL_LIST && res.Action() != pb.ActionType_FULL_LIST {
					continue
				}

				if (options.Action == pb.ActionType_FULL_DIFF || options.Action >= pb.ActionType_CREATE) && res.Action() < pb.ActionType_CREATE {
					continue
				}

				// No further filtering, send result
				if options.Name == "" && options.Type == pb.ItemType_ALL {
					cw.events <- registry.NewResult(res.Action(), res.Items())
				}

				// Filter by Name and or Type
				var filteredItems []registry.Item
				for _, i := range res.Items() {
					if options.Name != "" && i.Name() != options.Name {
						continue
					}
					if options.Type == pb.ItemType_SERVICE {
						if _, ok := i.(registry.Service); !ok {
							continue
						}
					}
					if options.Type == pb.ItemType_NODE {
						if _, ok := i.(registry.Node); !ok {
							continue
						}
					}
					filteredItems = append(filteredItems, i)
				}
				// Send results
				if len(filteredItems) > 0 {
					cw.events <- registry.NewResult(res.Action(), filteredItems)
				}
			}
		}
	}()
	return cw
}
