/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"context"
	"fmt"
	"regexp"

	"github.com/gyuho/goraph"
	"github.com/micro/go-micro/registry"
)

// Service defines the primary functions a service must be able to answer to for the registry
type Service interface {
	Start()
	Stop()

	IsRunning() bool
	IsExcluded() bool
	SetExcluded(ex bool)
	Check(context.Context) error

	Name() string
	Regexp() *regexp.Regexp
	Version() string
	Description() string
	Tags() []string
	GetDependencies() []Service
	AddDependency(string)
	SetRunningNodes([]*registry.Node)
	RunningNodes() []*registry.Node

	IsGeneric() bool
	IsGRPC() bool
	IsREST() bool

	RequiresFork() bool
	ForkStart()

	MatchesRegexp(string) bool

	BeforeInit() error
	AfterInit() error
}

// GetServicesByName returns a list of service that match the name given in argument
func (c *pydioregistry) GetServicesByName(name string) []Service {
	var s []Service

	for _, ss := range c.register {
		if matched, _ := regexp.MatchString(name, ss.Name()); matched {
			if !ss.IsExcluded() {
				s = append(s, ss)
			}
		}
	}

	return s
}

// ListServices gives the list of all services registered (whether started or not) in the main registry
func (c *pydioregistry) ListServices(withExcluded ...bool) ([]Service, error) {

	c.Lock()
	defer c.Unlock()

	var services []Service

	servicesID, ok := goraph.TopologicalSort(c.graph)
	if !ok {
		return nil, fmt.Errorf("Could not sort services")
	}

	for _, serviceID := range servicesID {
		if service, ok := c.register[serviceID.String()]; ok {
			if !service.IsExcluded() || (len(withExcluded) > 0 && withExcluded[0]) {
				services = append(services, service)
			}
		}
	}

	return services, nil
}
