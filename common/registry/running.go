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
	"fmt"
	"time"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/registry"
	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
)

// ListRunningServices returns a list of services that are registered with the main registry
// They may or may not belong to the app registry so we create a mock service in case they don't
func (c *pydioregistry) ListRunningServices() ([]Service, error) {

	c.runninglock.RLock()
	defer c.runninglock.RUnlock()

	var services []Service

	for _, p := range GetPeers() {
		for _, rs := range p.GetServices() {
			if s, ok := c.register[rs.Name]; ok {
				services = append(services, s)
			} else {
				services = append(services, NewMockFromMicroService(rs))
			}
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

// SetServiceStopped artificially removes a service from the running services list
// This may be necessary for processes started as forks and crashing unexpectedly
func (c *pydioregistry) SetServiceStopped(name string) error {
	// c.runningmutex.Lock()
	// defer c.runningmutex.Unlock()
	// for k, v := range c.running {
	// 	if v.Name == name {
	// 		c.running = append(c.running[:k], c.running[k+1:]...)
	// 		break
	// 	}
	// }
	return nil
}

func (c *pydioregistry) maintainRunningServicesList() {

	c.runninglock.Lock()
	defer c.runninglock.Unlock()

	results := make(chan *registry.Result)

	go func() {
		// Once we've retrieved the list once, we watch the services
		w, err := defaults.Registry().Watch()
		if err != nil {
			return
		}

		defer w.Stop()

		for {
			res, err := w.Next()
			if err != nil {
				<-time.After(5 * time.Second)
				continue
			}

			if res == nil {
				continue
			}

			results <- res
		}
	}()

	go func() {
		for {
			defaults.Registry().ListServices()
			time.Sleep(5 * time.Second)
		}
	}()

	go func() {
		for res := range results {
			a := res.Action
			s := res.Service

			switch a {
			case "create":
				beforeCnt := 0
				for _, peer := range c.peers {
					beforeCnt = beforeCnt + len(peer.GetServices(s.Name))
				}

				for _, n := range s.Nodes {
					if n == nil {
						continue
					}

					if c.GetPeer(n).Add(s, fmt.Sprintf("%d", n.Port)) {
						defaults.Broker().Publish(common.TopicServiceRegistration, &broker.Message{
							Body: []byte(common.EventTypeServiceRegistered),
							Header: map[string]string{
								common.EventHeaderServiceRegisterService: s.Name,
								common.EventHeaderServiceRegisterPeer:    fmt.Sprintf("%s:%d", n.Address, n.Port),
							},
						})
					}
					c.registerProcessFromNode(n, s.Name)
				}

				afterCnt := 0
				for _, peer := range c.peers {
					afterCnt = afterCnt + len(peer.GetServices(s.Name))
				}

				// We check the overall service has just been started
				if beforeCnt == 0 && afterCnt > 0 {
					ss, ok := c.register[s.Name]
					if !ok {
						ss = NewMockFromMicroService(s)
					}
					send(&Result{
						Action: "started",
						Service: ss,
					})
				}
			case "delete":
				// We check the overall service has just been started
				beforeCnt := 0
				for _, peer := range c.peers {
					beforeCnt = beforeCnt + len(peer.GetServices(s.Name))
				}

				for _, n := range s.Nodes {
					if c.GetPeer(n).Delete(s, fmt.Sprintf("%d", n.Port)) {
						defaults.Broker().Publish(common.TopicServiceRegistration, &broker.Message{
							Body: []byte(common.EventTypeServiceUnregistered),
							Header: map[string]string{
								common.EventHeaderServiceRegisterService: s.Name,
								common.EventHeaderServiceRegisterPeer:    fmt.Sprintf("%s:%d", n.Address, n.Port),
							},
						})
					}
					c.deregisterProcessFromNode(n, s.Name)
				}

				afterCnt := 0
				for _, peer := range c.peers {
					afterCnt = afterCnt + len(peer.GetServices(s.Name))
				}

				// We check the overall service has just been stopped
				if beforeCnt > 0 && afterCnt == 0 {
					ss, ok := c.register[s.Name]
					if !ok {
						ss = NewMockFromMicroService(s)
					}
					send(&Result{
						Action: "stopped",
						Service: ss,
					})
				}
			}
		}
	}()

	// Get the list of services once to kickstart things
	services, err := defaults.Registry().ListServices()
	if err != nil {
		return
	}
	for _, srv := range services {
		results <- &registry.Result{
			Action:  "create",
			Service: srv,
		}
	}
}