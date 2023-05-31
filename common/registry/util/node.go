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
	"github.com/pydio/cells/v4/common/utils/std"
	"strings"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/merger"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"golang.org/x/exp/maps"
)

func CreateNode() registry.Node {
	builder := strings.Builder{}
	builder.WriteString("process ")
	builder.WriteString(runtime.GetHostname())
	builder.WriteString("/")
	builder.WriteString(runtime.GetPID())

	i := &pb.Item{
		Id:       uuid.New(),
		Name:     builder.String(),
		Metadata: make(map[string]string),
	}
	n := &pb.Node{}
	return &node{I: i, D: n}
}

func ToProtoNode(d registry.Node) *pb.Node {
	if dd, ok := d.(*node); ok {
		return dd.D
	}
	return &pb.Node{}
}

func ToNode(i *pb.Item, d *pb.Node) registry.Node {
	return &node{I: i, D: d}
}

type node struct {
	I *pb.Item
	D *pb.Node
}

func (n *node) Hostname() string {
	return n.D.Hostname
}

func (n *node) IPs() []string {
	return n.D.GetIps()
}

func (n *node) AdvertiseIP() string {
	return n.D.GetAdvertiseIp()
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
	return n.I.Name
}

func (n *node) ID() string {
	return n.I.Id
}

func (n *node) Metadata() map[string]string {
	if n.I.Metadata == nil {
		return map[string]string{}
	}
	return maps.Clone(n.I.Metadata)
}

func (n *node) SetMetadata(meta map[string]string) {
	n.I.Metadata = meta
}

func (n *node) As(i interface{}) bool {
	if ii, ok := i.(*registry.Node); ok {
		*ii = n
		return true
	}
	return false
}

func (n *node) Clone() interface{} {
	clone := &node{}

	clone.I = std.DeepClone(n.I)
	clone.D = std.DeepClone(n.D)

	return clone
}
