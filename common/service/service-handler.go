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

package service

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"

	proto "github.com/pydio/cells/common/service/proto"
)

// StatusHandler provides functionality for getting the status of a service
type StatusHandler struct {
	address string
}

// SetAddress for a service
func (sh *StatusHandler) SetAddress(a string) {
	sh.address = a
}

// Status of the service - If we reach this point, it means that this micro service is correctly up and running
func (sh *StatusHandler) Status(ctx context.Context, in *empty.Empty, out *proto.StatusResponse) error {
	out.OK = true
	out.Address = sh.address

	return nil
}

// StopHandler provides functionality for stopping a service
type StopHandler struct {
	s Service
}

// SetService handler
func (s *StopHandler) SetService(srv Service) {
	s.s = srv
}

// ProcessEvent handler
func (s *StopHandler) ProcessEvent(ctx context.Context, in *proto.StopEvent) error {
	if s.s.Name() == in.ServiceName {
		s.s.Stop()
	}
	return nil
}
