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

package config

import (
	"strings"

	"github.com/pydio/cells/common"
)

var (
	exposedConfigs    map[string]common.XMLSerializableForm
	restEditablePaths []string
)

// RegisterExposedConfigs let services register specific forms for configs editions
// Used by discovery service
func RegisterExposedConfigs(serviceName string, form common.XMLSerializableForm) {
	if exposedConfigs == nil {
		exposedConfigs = make(map[string]common.XMLSerializableForm)
	}
	exposedConfigs[serviceName] = form
}

// ExposedConfigsForService returns exposed configs for service
func ExposedConfigsForService(serviceName string) common.XMLSerializableForm {
	if exposedConfigs == nil {
		return nil
	}
	if e, ok := exposedConfigs[serviceName]; ok {
		return e
	}
	return nil
}

// RegisterRestEditablePath registers a config path that can be exposed and modified via the REST API
func RegisterRestEditablePath(segments ...string) {
	p := strings.Join(segments, "/")
	restEditablePaths = append(restEditablePaths, p)
}

// IsRestEditable checks if the given path is allowed to be read/written via the REST API.
func IsRestEditable(path string) bool {
	path = strings.Trim(path, "/")
	for _, p := range restEditablePaths {
		if strings.HasPrefix(path, p) {
			return true
		}
	}
	return false
}
