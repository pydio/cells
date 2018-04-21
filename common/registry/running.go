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
	"strings"
	"sync"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service/defaults"
)

var (
	runningOnce  = &sync.Once{}
	runningMutex = &sync.Mutex{}
)

// ListRunningServices returns a list of services that are registered with the main registry
// They may or may not belong to the app registry so we create a mock service in case they don't
func (c *pydioregistry) ListRunningServices() ([]Service, error) {

	runningOnce.Do(func() {
		c.maintainRunningServicesList()
	})

	c.runningmutex.Lock()
	defer c.runningmutex.Unlock()

	var services []Service

	for _, rs := range c.running {
		if service, ok := c.register[rs.Name]; ok {
			service.SetRunningNodes(rs.Nodes)
			services = append(services, service)
		} else {
			mock := &mockService{name: rs.Name, running: true, nodes: rs.Nodes}
			if strings.HasPrefix(rs.Name, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_) {
				mock.tags = []string{common.SERVICE_TAG_DATASOURCE}
			}
			services = append(services, mock)
		}
	}

	return services, nil
}

// maintain a list of services currently running for easy discovery
func (c *pydioregistry) maintainRunningServicesList() {

	// once := &sync.Once{}
	//
	//
	// go func() {
	// 	tick := time.Tick(c.Options().PollInterval)
	// 	timeout := time.After(5 * c.Options().PollInterval)

	// for {
	// 	select {
	// 	case <-tick:
	running, _ := defaults.Registry().ListServices()
	// if err != nil {
	// 	continue
	// }

	// For the first run, we always lock the mutex
	c.runningmutex.Lock()
	c.running = running
	c.runningmutex.Unlock()

	// 		case <-timeout:
	// 			once.Do(func() {
	// 				c.runningmutex.Unlock()
	// 			})
	// 		}
	// 	}
	// }()

	go func() {

		// Once we've retrieved the list once, we watch the services
		w, err := defaults.Registry().Watch()
		if err != nil {
			return
		}

		for {
			res, err := w.Next()
			if err != nil {
				continue
			}

			if res == nil {
				continue
			}

			a := res.Action
			s := res.Service

			c.runningmutex.Lock()
			switch a {
			case "create":
				found := false
				for k, v := range c.running {
					if v.Name == s.Name {
						c.running[k] = s
						found = true
						break
					}
				}

				if !found {
					c.running = append(c.running, s)
				}
			case "delete":
				for k, v := range c.running {
					if v.Name == s.Name {
						c.running = append(c.running[:k], c.running[k+1:]...)
						break
					}
				}
			}
			c.runningmutex.Unlock()

		}
	}()
}
