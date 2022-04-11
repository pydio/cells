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
	"errors"
	"strings"

	"github.com/pydio/cells/v4/common/etl/models"

	"github.com/pydio/cells/v4/common"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

type service struct {
	s *pb.Service
}

func (s *service) ID() string {
	return s.s.Id
}

func (s *service) Name() string {
	return s.s.Name
}

func (s *service) Version() string {
	return s.s.Version
}

func (s *service) Metadata() map[string]string {
	if s.s.Metadata == nil {
		return map[string]string{}
	}
	return s.s.Metadata
}

func (s *service) Nodes() []registry.Node {
	var nodes []registry.Node
	for _, n := range s.s.Nodes {
		nodes = append(nodes, &node{n})
	}
	return nodes
}

func (s *service) Start() error {
	return errors.New("not implemented")
}

func (s *service) Stop() error {
	return errors.New("not implemented")
}

func (s *service) Tags() []string {
	return s.s.Tags
}

func (s *service) IsGRPC() bool {
	return strings.HasPrefix(s.s.Name, common.ServiceGrpcNamespace_)
}

func (s *service) IsREST() bool {
	return strings.HasPrefix(s.s.Name, common.ServiceRestNamespace_)
}

func (s *service) IsGeneric() bool {
	return !s.IsGRPC() && !s.IsREST()
}

func (s *service) As(i interface{}) bool {
	ii, ok := i.(*registry.Service)
	if ok {
		*ii = s
		return true
	}
	return false
}

func (s *service) Equals(differ models.Differ) bool {
	neu, ok := differ.(*service)
	if !ok {
		return false
	}
	return s.ID() == neu.ID() &&
		s.Name() == neu.Name()
}

func (s *service) IsDeletable(m map[string]string) bool {
	return true
}

func (s *service) IsMergeable(differ models.Differ) bool {
	return s.ID() == differ.GetUniqueId()
}

func (s *service) GetUniqueId() string {
	return s.ID()
}

func (s *service) Merge(differ models.Differ, params map[string]string) (models.Differ, error) {
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

func (s *node) Equals(differ models.Differ) bool {
	neu, ok := differ.(*service)
	if !ok {
		return false
	}
	return s.ID() == neu.ID() &&
		s.Name() == neu.Name()
}

func (s *node) IsDeletable(m map[string]string) bool {
	return true
}

func (s *node) IsMergeable(differ models.Differ) bool {
	return s.ID() == differ.GetUniqueId()
}

func (s *node) GetUniqueId() string {
	return s.ID()
}

func (s *node) Merge(differ models.Differ, params map[string]string) (models.Differ, error) {
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

func ToProtoItems(ii []registry.Item) []*pb.Item {
	var items []*pb.Item

	for _, i := range ii {
		items = append(items, ToProtoItem(i))
	}

	return items
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
	if ss, ok := s.(*service); ok {
		return ss.s
	}

	var nodes []*pb.Node

	for _, n := range s.Nodes() {
		nodes = append(nodes, ToProtoNode(n))
	}

	return &pb.Service{
		Id:       s.ID(),
		Name:     s.Name(),
		Version:  s.Version(),
		Metadata: s.Metadata(),
		Tags:     s.Tags(),
		Nodes:    nodes,
		Options:  new(pb.Options),
	}
}

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
	return &service{s}
}

func ToNode(n *pb.Node) registry.Node {
	return &node{n}
}
