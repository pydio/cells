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

func ToProtoServer(s registry.Server) *pb.Server {
	if nn, ok := s.(*server); ok {
		return nn.s
	}

	return &pb.Server{
		Id:        s.ID(),
		Name:      s.Name(),
		Address:   s.Address(),
		Endpoints: s.Endpoints(),
		Metadata:  s.Metadata(),
	}
}

func ToServer(s *pb.Server) registry.Server {
	return &server{s}
}

type server struct {
	s *pb.Server
}

func (s *server) ID() string {
	return s.s.Id
}

func (s *server) Name() string {
	return s.s.Name
}

func (s *server) Address() []string {
	return s.s.Address
}

func (s *server) Endpoints() []string {
	return s.s.Endpoints
}

func (s *server) Metadata() map[string]string {
	return s.s.Metadata
}

func (s *server) As(i interface{}) bool {
	ii, ok := i.(*registry.Server)
	if ok {
		*ii = s
		return true
	}

	return false
}

func (s *server) Equals(differ merger.Differ) bool {
	neu, ok := differ.(*service)
	if !ok {
		return false
	}
	return s.ID() == neu.ID() &&
		s.Name() == neu.Name()
}

func (s *server) IsDeletable(m map[string]string) bool {
	return true
}

func (s *server) IsMergeable(differ merger.Differ) bool {
	return s.ID() == differ.GetUniqueId()
}

func (s *server) GetUniqueId() string {
	return s.ID()
}

func (s *server) Merge(differ merger.Differ, params map[string]string) (merger.Differ, error) {
	// Return target
	return differ, nil
}
