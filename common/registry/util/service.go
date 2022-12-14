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

	"golang.org/x/exp/maps"

	"github.com/pydio/cells/v4/common"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/merger"
)

func ToProtoService(s registry.Service) *pb.Service {
	if ss, ok := s.(*service); ok {
		return ss.S
	}

	return &pb.Service{
		Version: s.Version(),
		Tags:    s.Tags(),
		Options: new(pb.Options),
	}
}

func ToService(i *pb.Item, s *pb.Service) registry.Service {
	return &service{I: i, S: s}
}

type service struct {
	I *pb.Item
	S *pb.Service
}

func (s *service) ID() string {
	return s.I.Id
}

func (s *service) Name() string {
	return s.I.Name
}

func (s *service) Version() string {
	return s.S.Version
}

func (s *service) Metadata() map[string]string {
	if s.I.Metadata == nil {
		return map[string]string{}
	}
	return maps.Clone(s.I.Metadata)
}

func (s *service) SetMetadata(meta map[string]string) {
	s.I.Metadata = meta
}

func (s *service) Start(oo ...registry.RegisterOption) error {
	return errors.New("not implemented")
}

func (s *service) Stop(oo ...registry.RegisterOption) error {
	return errors.New("not implemented")
}

func (s *service) Tags() []string {
	return s.S.Tags
}

func (s *service) ServerScheme() string {
	if strings.HasPrefix(s.I.Name, common.ServiceGrpcNamespace_) {
		return "grpc://"
	} else if strings.HasPrefix(s.I.Name, common.ServiceRestNamespace_) {
		return "http://"
	} else {
		return "generic://"
	}
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
