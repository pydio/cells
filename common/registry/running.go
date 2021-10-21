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

package registry

import (
	"github.com/micro/go-micro/registry"
)

// GetRunningServices returns a list of services that are registered with the main registry
// They may or may not belong to the app registry so we create a mock service in case they don't
func (c *pydioregistry) GetRunningService(name string) ([]Service, error) {
	var services []Service

	rss, err := registry.DefaultRegistry.GetService(name)
	if err != nil {
		return nil, err
	}

	for _, rs := range rss {
		if s, ok := c.register[rs.Name]; ok {
			services = append(services, s)
		} else {
			services = append(services, NewMockFromMicroService(rs))
		}
	}

	return services, nil
}

// ListRunningServices returns a list of services that are registered with the main registry
// They may or may not belong to the app registry so we create a mock service in case they don't
func (c *pydioregistry) ListRunningServices() ([]Service, error) {

	c.runninglock.RLock()
	defer c.runninglock.RUnlock()

	var services []Service

	rss, err := registry.DefaultRegistry.ListServices()
	if err != nil {
		return nil, err
	}

	for _, rs := range rss {
		if s, ok := c.register[rs.Name]; ok {
			services = append(services, s)
		} else {
			services = append(services, NewMockFromMicroService(rs))
		}
	}

	// De-dup
	result := services[:0]
	encountered := map[string]bool{}
	for _, s := range services {
		name := s.Name()
		if encountered[name] == true {
			// Do not add duplicate.
		} else {
			encountered[name] = true
			result = append(result, s)
		}
	}

	return result, nil
}
