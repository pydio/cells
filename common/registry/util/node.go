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

package util

import (
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/merger"
)

func ToProtoNode(n registry.Node) *pb.Node {
	if nn, ok := n.(*node); ok {
		return nn.n
	}

	return &pb.Node{
		Id:        n.ID(),
		Name:      n.Name(),
		Address:   n.Address(),
		Endpoints: n.Endpoints(),
		Metadata:  n.Metadata(),
	}
}

func ToNode(n *pb.Node) registry.Node {
	return &node{n}
}

type node struct {
	n *pb.Node
}

func (n *node) ID() string {
	return n.n.Id
}

func (n *node) Name() string {
	return n.n.Name
}

func (n *node) Address() []string {
	return n.n.Address
}

func (n *node) Endpoints() []string {
	return n.n.Endpoints
}

func (n *node) Metadata() map[string]string {
	return n.n.Metadata
}

func (n *node) As(i interface{}) bool {
	ii, ok := i.(*registry.Node)
	if ok {
		*ii = n
		return true
	}

	return false
}

func (n *node) Equals(differ merger.Differ) bool {
	neu, ok := differ.(*service)
	if !ok {
		return false
	}
	return n.ID() == neu.ID() &&
		n.Name() == neu.Name()
}

func (n *node) IsDeletable(m map[string]string) bool {
	return true
}

func (n *node) IsMergeable(differ merger.Differ) bool {
	return n.ID() == differ.GetUniqueId()
}

func (n *node) GetUniqueId() string {
	return n.ID()
}

func (n *node) Merge(differ merger.Differ, params map[string]string) (merger.Differ, error) {
	// Return target
	return differ, nil
}
