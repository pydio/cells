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

package memory

import (
	"errors"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

type watcher struct {
	id   string
	wo   registry.Options
	res  chan registry.Result
	exit chan bool
}

func (m *watcher) Next() (registry.Result, error) {
	for {
		select {
		case r := <-m.res:
			if r.Items() == nil {
				continue
			}

			var items []registry.Item
			for _, item := range r.Items() {
				if len(m.wo.Name) > 0 && m.wo.Name != item.Name() {
					continue
				}

				switch m.wo.Type {
				case pb.ItemType_SERVICE:
					var service registry.Service
					if item.As(&service) && (m.wo.Filter == nil || m.wo.Filter(item)) {
						return r, nil
					}
					continue
				case pb.ItemType_NODE:
					var node registry.Node
					if item.As(&node) && (m.wo.Filter == nil || m.wo.Filter(item)) {
						return r, nil
					}
					continue
				}

				return r, nil
			}

			return registry.NewResult(r.Action(), items), nil
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
	action string
	items  []registry.Item
}

func (r *result) Action() string {
	return r.action
}

func (r *result) Items() []registry.Item {
	return r.items
}
