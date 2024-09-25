/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package registry

import (
	"errors"

	pb "github.com/pydio/cells/v4/common/proto/registry"
)

type watcher struct {
	id   string
	wo   Options
	res  chan Result
	exit chan bool
}

func NewWatcher(id string, opts Options, res chan Result) Watcher {
	exit := make(chan bool)
	return &watcher{
		id:   id,
		wo:   opts,
		res:  res,
		exit: exit,
	}
}

func (m *watcher) actionMatches(event, filter pb.ActionType) bool {
	// FULL_LIST : specific action only
	if filter == pb.ActionType_FULL_LIST && event != pb.ActionType_FULL_LIST {
		return false
	}

	// FULL_DIFF : skip diff and full_list
	if filter == pb.ActionType_FULL_DIFF && event < pb.ActionType_CREATE {
		return false
	}

	// Specific Action: checking action matches
	if filter >= pb.ActionType_CREATE && event != filter {
		return false
	}
	return true
}

func (m *watcher) Next() (Result, error) {

	for {
		select {
		case r := <-m.res:

			// If filter Actions are defined, skip if event does not match any
			if !m.wo.ActionsMatch(r.Action()) {
				continue
			}

			// Return everything
			if len(m.wo.IDs) == 0 && len(m.wo.Names) == 0 && len(m.wo.Types) == 0 && len(m.wo.Filters) == 0 {
				return r, nil
			}

			var items []Item
			for _, item := range r.Items() {
				foundID := false
				for _, id := range m.wo.IDs {
					if id == item.ID() {
						foundID = true
						break
					}
				}
				if len(m.wo.IDs) > 0 && !foundID {
					continue
				}

				foundName := false
				for _, name := range m.wo.Names {
					if name == item.Name() {
						foundName = true
						break
					}
				}

				if len(m.wo.Names) > 0 && !foundName {
					continue
				}

				foundType := false
			L:
				for _, itemType := range m.wo.Types {
					switch itemType {
					case pb.ItemType_NODE:
						var node Node
						if item.As(&node) {
							foundType = true
							break L
						}
					case pb.ItemType_SERVICE:
						var service Service
						if item.As(&service) {
							foundType = true
							break L
						}
					case pb.ItemType_SERVER:
						var node Server
						if item.As(&node) {
							foundType = true
							break L
						}
					case pb.ItemType_DAO:
						var dao Dao
						if item.As(&dao) {
							foundType = true
							break L
						}
					case pb.ItemType_EDGE:
						var edge Edge
						if item.As(&edge) {
							foundType = true
							break L
						}
					case pb.ItemType_GENERIC, pb.ItemType_ADDRESS, pb.ItemType_TAG, pb.ItemType_ENDPOINT:
						var generic Generic
						if item.As(&generic) &&
							(itemType == pb.ItemType_GENERIC || itemType == generic.Type()) {
							foundType = true
							break L
						} else {
							foundType = true
							break L
						}
					}
				}

				if len(m.wo.Types) > 0 && !foundType {
					continue
				}

				foundFilter := true
				for _, filter := range m.wo.Filters {
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

			if len(items) == 0 {
				continue
			}

			return &result{
				action: r.Action(),
				items:  items,
			}, nil
		case <-m.wo.Context.Done():
			return nil, errors.New("context done")
		case <-m.exit:
			return nil, errors.New("watcher stopped")
		}
	}
}

func (m *watcher) Stop() {
	select {
	case <-m.exit:
		return
	default:
		close(m.exit)
	}
}

type result struct {
	action pb.ActionType
	items  []Item
}

func NewResult(action pb.ActionType, items []Item) Result {
	return &result{
		action: action,
		items:  items,
	}
}

func (r *result) Action() pb.ActionType {
	return r.action
}

func (r *result) Items() []Item {
	return r.items
}
