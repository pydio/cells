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

package service

import (
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/registry"
)

type Status string

const (
	MetaStatusKey             = "status"
	StatusStopped      Status = "stopped"
	StatusStarting     Status = "starting"
	StatusServing      Status = "serving"
	StatusReady        Status = "ready"
	StatusError        Status = "error"
	StatusStopping     Status = "stopping"
	MetaDescriptionKey        = "description"
)

// RegistryHasServiceWithStatus finds a service with given status in the registry passed as parameter
func RegistryHasServiceWithStatus(reg registry.Registry, name string, status Status) bool {
	if s, e := reg.Get(common.ServiceGrpcNamespace_ + common.ServiceUser); e == nil {
		meta := s.(registry.Service).Metadata()
		if v, o := meta[MetaStatusKey]; o && v == string(status) {
			return true
		}
	}
	return false
}
