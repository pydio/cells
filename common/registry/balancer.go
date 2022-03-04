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
	"fmt"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"net/http/httputil"
	"net/url"
	"sync"
)

type Balancer struct {
	m map[string]*[]Backend
	sync.RWMutex
}

type Backend struct {
	u            *url.URL
	Alive        bool
	mux          sync.RWMutex
	ReverseProxy *httputil.ReverseProxy
}

func NewBalancer(r Registry) {
	b := &Balancer{}

	nodes, _ := r.List(WithType(pb.ItemType_NODE))
	for _, n := range nodes {
		var node Node
		n.As(&node)

		for _, endpoint := range node.Endpoints() {
			fmt.Println(endpoint)
		}
	}

	go b.watch(r)
}

func (b *Balancer) watch(r Registry) {
	_, err := r.Watch(WithType(pb.ItemType_NODE))
	if err != nil {
		return
	}
}
