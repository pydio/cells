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
	"context"
	"errors"
	"io"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
)

type streamWatcher struct {
	stream  pb.Registry_WatchClient
	options registry.Options
	closed  chan bool
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
		item := util.ToItem(i)
		foundFilter := true
		for _, filter := range s.options.Filters {
			if !filter(item) {
				foundFilter = false
				break
			}
		}

		if !foundFilter {
			continue
		}

		items = append(items, item)
	}
	// fmt.Println("Got NEXT on streamWatcher", r.Action, len(r.Items))
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

func newStreamWatcher(stream pb.Registry_WatchClient, options registry.Options) registry.Watcher {
	return &streamWatcher{
		stream:  stream,
		options: options,
		closed:  make(chan bool),
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
		return res, nil
	case <-s.close:
		return nil, io.EOF
	}
}

func (s *chanWatcher) Stop() {
	if s.closed {
		// do nothing
		return
	}
	s.closed = true
	s.onClose()
	close(s.close)
	close(s.events)
}

func newChanWatcher(ctx context.Context, input chan registry.Result, onClose func(), options registry.Options) registry.Watcher {
	cw := &chanWatcher{
		events:  make(chan registry.Result),
		close:   make(chan bool, 1),
		onClose: onClose,
	}
	go func() {
		for {
			select {
			case <-ctx.Done():
				cw.Stop()
				return
			case res := <-input:
				if !cw.closed {
					// Check Actions filtering
					if !options.ActionsMatch(res.Action()) {
						break
					}
					// No further filtering, send result
					if len(options.Names) == 0 && len(options.Types) == 0 && len(options.Filters) == 0 {
						cw.events <- registry.NewResult(res.Action(), res.Items())
					}

					var items []registry.Item
					for _, item := range res.Items() {
						// Checking names match
						foundName := false
						for _, name := range options.Names {
							if name == item.Name() {
								foundName = true
								break
							}
						}

						if len(options.Names) > 0 && !foundName {
							continue
						}

						// Checking types match
						foundType := false
					L:
						for _, itemType := range options.Types {
							switch itemType {
							case pb.ItemType_SERVICE:
								var service registry.Service
								if item.As(&service) {
									foundType = true
									break L
								}
							case pb.ItemType_SERVER:
								var node registry.Server
								if item.As(&node) {
									foundType = true
									break L
								}
							case pb.ItemType_DAO:
								var dao registry.Dao
								if item.As(&dao) {
									foundType = true
									break L
								}
							case pb.ItemType_EDGE:
								var edge registry.Edge
								if item.As(&edge) {
									foundType = true
									break L
								}
							case pb.ItemType_GENERIC, pb.ItemType_ADDRESS, pb.ItemType_TAG, pb.ItemType_ENDPOINT:
								var generic registry.Generic
								if item.As(&generic) &&
									(itemType == pb.ItemType_GENERIC || itemType == generic.Type()) {
									foundType = true
									break L
								}
							}
						}

						if len(options.Types) > 0 && !foundType {
							continue
						}

						foundFilter := true
						for _, filter := range options.Filters {
							if !filter(item) {
								foundFilter = false
								break
							}
						}

						if !foundFilter {
							continue
						}

						items = append(items, item)
					}
					// Send results
					if len(items) > 0 {
						cw.events <- registry.NewResult(res.Action(), items)
					}
				}
			}
		}
	}()
	return cw
}
