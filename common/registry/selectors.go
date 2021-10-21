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

package registry

import (
	"fmt"
	"strings"

	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
)

// PeerClientSelector creates a Selector Filter to restrict call to a given PeerAddress
func PeerClientSelector(srvName string, targetPeer string) selector.SelectOption {
	return selector.WithFilter(func(in []*registry.Service) (out []*registry.Service) {
		for _, current := range in {
			if current.Name != srvName {
				continue
			}

			// create a copy so as not to override service registry info
			service := new(registry.Service)
			*service = *current

			var nodes []*registry.Node
			for _, n := range service.Nodes {
				for _, address := range strings.Split(targetPeer, "|") {
					if n.Address == address {
						nodes = append(nodes, n)
						break
					}
					if h, ok := n.Metadata[serviceMetaHostname]; ok && h == address {
						nodes = append(nodes, n)
						break
					}
				}
			}

			if len(nodes) > 0 {
				service.Nodes = nodes
				out = append(out, service)
			}
		}
		return
	})
}

// FixedInstanceSelector creates a Selector Filter to restrict call to a given PeerAddress
func FixedInstanceSelector(srvName string, targetAddress string) selector.SelectOption {
	return selector.WithFilter(func(in []*registry.Service) (out []*registry.Service) {
		for _, current := range in {
			if current.Name != srvName {
				continue
			}

			// create a copy so as not to override service registry info
			service := new(registry.Service)
			*service = *current

			var nodes []*registry.Node
			for _, n := range service.Nodes {
				if fmt.Sprintf("%s:%d", n.Address, n.Port) == targetAddress {
					nodes = append(nodes, n)
					break
				}
			}
			if len(nodes) > 0 {
				service.Nodes = nodes
				out = append(out, service)
			}
		}
		return
	})
}
