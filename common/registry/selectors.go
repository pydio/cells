/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
)

// PeerClientSelector creates a Selector Filter to restrict call to a given PeerAddress
func PeerClientSelector(srvName string, targetPeer string) selector.SelectOption {
	return selector.WithFilter(func(services []*registry.Service) (out []*registry.Service) {
		for _, srv := range services {
			if srv.Name != srvName {
				continue
			}
			var nodes []*registry.Node
			for _, n := range srv.Nodes {
				if n.Address == targetPeer {
					nodes = append(nodes, n)
					break
				}
				if h, ok := n.Metadata[serviceMetaHostname]; ok && h == targetPeer {
					nodes = append(nodes, n)
					break
				}
			}
			if len(nodes) > 0 {
				srv.Nodes = nodes
				out = append(out, srv)
			}
		}
		return
	})
}

// PeerClientSelector creates a Selector Filter to restrict call to a given PeerAddress
func FixedInstanceSelector(srvName string, targetAddress string) selector.SelectOption {
	return selector.WithFilter(func(services []*registry.Service) (out []*registry.Service) {
		for _, srv := range services {
			if srv.Name != srvName {
				continue
			}
			var nodes []*registry.Node
			for _, n := range srv.Nodes {
				if fmt.Sprintf("%s:%d", n.Address, n.Port) == targetAddress {
					nodes = append(nodes, n)
					break
				}
			}
			if len(nodes) > 0 {
				srv.Nodes = nodes
				out = append(out, srv)
			}
		}
		return
	})
}
