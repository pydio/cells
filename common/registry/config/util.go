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

package configregistry

import (
	"errors"
	"strings"

	"github.com/pydio/cells/v4/common/etl/models"

	"github.com/pydio/cells/v4/common"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

type serviceItem struct {
	s *pb.Service
}

func (s *serviceItem) ID() string {
	return s.s.Id
}

func (s *serviceItem) Name() string {
	return s.s.Name
}

func (s *serviceItem) Version() string {
	return s.s.Version
}

func (s *serviceItem) Metadata() map[string]string {
	if s.s.Metadata == nil {
		return map[string]string{}
	}
	return s.s.Metadata
}

func (s *serviceItem) Nodes() []registry.Node {
	var nodes []registry.Node
	for _, n := range s.s.Nodes {
		nodes = append(nodes, &node{n})
	}
	return nodes
}

func (s *serviceItem) Start() error {
	return errors.New("not implemented")
}

func (s *serviceItem) Stop() error {
	return errors.New("not implemented")
}

func (s *serviceItem) Tags() []string {
	return strings.Split(s.s.Metadata["tags"], ",")
}

func (s *serviceItem) IsGRPC() bool {
	return strings.HasPrefix(s.s.Name, common.ServiceGrpcNamespace_)
}

func (s *serviceItem) IsREST() bool {
	return strings.HasPrefix(s.s.Name, common.ServiceRestNamespace_)
}

func (s *serviceItem) IsGeneric() bool {
	return !s.IsGRPC() && !s.IsREST()
}

func (s *serviceItem) As(i interface{}) bool {
	ii, ok := i.(*registry.Service)
	if ok {
		*ii = s
		return true
	}
	return false
}

func (s *serviceItem) Equals(differ models.Differ) bool {
	neu, ok := differ.(*serviceItem)
	if !ok {
		return false
	}
	return s.ID() == neu.ID() &&
		s.Name() == neu.Name()
}

func (s *serviceItem) IsDeletable(m map[string]string) bool {
	return true
}

func (s *serviceItem) IsMergeable(differ models.Differ) bool {
	return s.ID() == differ.GetUniqueId()
}

func (s *serviceItem) GetUniqueId() string {
	return s.ID()
}

func (s *serviceItem) Merge(differ models.Differ, params map[string]string) (models.Differ, error) {
	// Return target
	return differ, nil
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
	return []string{n.n.Address}
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

func (n *node) Equals(differ models.Differ) bool {
	neu, ok := differ.(*node)
	if !ok {
		return false
	}
	return n.ID() == neu.ID() &&
		n.Name() == neu.Name()
}

func (n *node) IsDeletable(m map[string]string) bool {
	return true
}

func (n *node) IsMergeable(differ models.Differ) bool {
	return n.ID() == differ.GetUniqueId()
}

func (n *node) GetUniqueId() string {
	return n.ID()
}

func (n *node) Merge(differ models.Differ, params map[string]string) (models.Differ, error) {
	// Return target
	return differ, nil
}

type endpoint struct {
	e *pb.Endpoint
}

func (e *endpoint) Name() string {
	return e.e.Name
}

func (e *endpoint) Metadata() map[string]string {
	return e.e.Metadata
}

func ToProtoItem(i registry.Item) *pb.Item {
	item := &pb.Item{}

	switch v := i.(type) {
	case registry.Service:
		item.Item = &pb.Item_Service{Service: ToProtoService(v)}
	case registry.Node:
		item.Item = &pb.Item_Node{Node: ToProtoNode(v)}
	}

	return item
}

func ToProtoService(s registry.Service) *pb.Service {
	if ss, ok := s.(*serviceItem); ok {
		return ss.s
	}

	var nodes []*pb.Node

	for _, n := range s.Nodes() {
		// No need to store more than the id
		nodes = append(nodes, &pb.Node{Id: n.ID()})
	}

	return &pb.Service{
		Id:       s.ID(),
		Name:     s.Name(),
		Version:  s.Version(),
		Metadata: s.Metadata(),
		// Endpoints: endpoints,
		Nodes:   nodes,
		Options: new(pb.Options),
	}
}

func ToProtoNode(n registry.Node) *pb.Node {
	if nn, ok := n.(*node); ok {
		return nn.n
	}

	// TODO v4
	address := ""
	if len(n.Address()) > 0 {
		address = n.Address()[0]
	}

	return &pb.Node{
		Id:        n.ID(),
		Name:      n.Name(),
		Address:   address,
		Endpoints: n.Endpoints(),
		Metadata:  n.Metadata(),
	}
}

func ToItem(s *pb.Item) registry.Item {
	switch v := s.Item.(type) {
	case *pb.Item_Service:
		return ToService(v.Service)
	case *pb.Item_Node:
		return ToNode(v.Node)
	}

	return nil
}

func ToService(s *pb.Service) registry.Service {
	return &serviceItem{s}
}

func ToNode(n *pb.Node) registry.Node {
	return &node{n}
}
