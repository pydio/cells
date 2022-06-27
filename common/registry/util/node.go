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

package util

import (
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	server2 "github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/utils/merger"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func CreateNode() registry.Node {
	meta := server2.InitPeerMeta()
	i := &pb.Item{
		Id:       uuid.New(),
		Name:     "process " + meta[runtime.NodeMetaHostName] + "/" + meta[runtime.NodeMetaPID],
		Metadata: meta,
	}
	n := &pb.Node{}
	return &node{i: i, d: n}
}

func ToProtoNode(d registry.Node) *pb.Node {
	if dd, ok := d.(*node); ok {
		return dd.d
	}
	return &pb.Node{}
}

func ToNode(i *pb.Item, d *pb.Node) registry.Node {
	return &node{i: i, d: d}
}

type node struct {
	i *pb.Item
	d *pb.Node
}

func (n *node) Hostname() string {
	return n.d.Hostname
}

func (n *node) IPs() []string {
	return n.d.GetIps()
}

func (n *node) AdvertiseIP() string {
	return n.d.GetAdvertiseIp()
}

func (n *node) Equals(differ merger.Differ) bool {
	if di, ok := differ.(*node); ok {
		return di.ID() == n.ID() && n.Name() == di.Name()
	}
	return false
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

func (n *node) Merge(differ merger.Differ, m map[string]string) (merger.Differ, error) {
	return differ, nil
}

func (n *node) Name() string {
	return n.i.Name
}

func (n *node) ID() string {
	return n.i.Id
}

func (n *node) Metadata() map[string]string {
	return n.i.Metadata
}

func (n *node) As(i interface{}) bool {
	if ii, ok := i.(*registry.Node); ok {
		*ii = n
		return true
	}
	return false
}
