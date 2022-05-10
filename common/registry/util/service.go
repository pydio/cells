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
	"errors"
	"strings"

	"github.com/pydio/cells/v4/common"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/merger"
)

func ToProtoService(s registry.Service) *pb.Service {
	if ss, ok := s.(*service); ok {
		return ss.s
	}

	return &pb.Service{
		Version: s.Version(),
		Tags:    s.Tags(),
		Options: new(pb.Options),
	}
}

func ToService(i *pb.Item, s *pb.Service) registry.Service {
	return &service{i: i, s: s}
}

type service struct {
	i *pb.Item
	s *pb.Service
}

func (s *service) ID() string {
	return s.i.Id
}

func (s *service) Name() string {
	return s.i.Name
}

func (s *service) Version() string {
	return s.s.Version
}

func (s *service) Metadata() map[string]string {
	if s.i.Metadata == nil {
		return map[string]string{}
	}
	return s.i.Metadata
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
	return strings.HasPrefix(s.i.Name, common.ServiceGrpcNamespace_)
}

func (s *service) IsREST() bool {
	return strings.HasPrefix(s.i.Name, common.ServiceRestNamespace_)
}

func (s *service) IsGeneric() bool {
	return !s.IsGRPC() && !s.IsREST()
}

func (s *service) As(i interface{}) bool {
	if ii, ok := i.(*registry.Service); ok {
		*ii = s
		return true
	}
	return false
}

func (s *service) Equals(differ merger.Differ) bool {
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

func (s *service) IsMergeable(differ merger.Differ) bool {
	return s.ID() == differ.GetUniqueId()
}

func (s *service) GetUniqueId() string {
	return s.ID()
}

func (s *service) Merge(differ merger.Differ, params map[string]string) (merger.Differ, error) {
	// Return target
	return differ, nil
}
