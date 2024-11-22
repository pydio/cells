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
	"golang.org/x/exp/maps"

	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/utils/merger"
	"github.com/pydio/cells/v5/common/utils/std"
)

func ToProtoServer(s registry.Server) *pb.Server {
	if nn, ok := s.(*server); ok {
		return nn.S
	}
	return &pb.Server{}
}

func ToServer(i *pb.Item, s *pb.Server) registry.Server {
	return &server{S: s, I: i}
}

type server struct {
	I *pb.Item
	S *pb.Server
}

func (s *server) ID() string {
	return s.I.Id
}

func (s *server) Name() string {
	return s.I.Name
}

func (s *server) Metadata() map[string]string {
	return maps.Clone(s.I.Metadata)
}

func (s *server) SetMetadata(meta map[string]string) {
	s.I.Metadata = meta
}

func (s *server) Server() {}

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

func (d *server) Clone() interface{} {
	clone := &server{}

	clone.I = std.DeepClone(d.I)
	clone.S = std.DeepClone(d.S)

	return clone
}
