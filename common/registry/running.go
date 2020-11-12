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
	"sync"
	"time"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/registry"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
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

// maintain a list of services currently running for easy discovery
func (c *pydioregistry) maintainRunningServicesList() {
	c.runninglock.Lock()
	defer c.runninglock.Unlock()

	// To ensure the watch is properly populated
	initialServices, err := defaults.Registry().ListServices()
	if err != nil {
		log.Fatal("Could not retrieve initial services list")
	}

	wg := &sync.WaitGroup{}
	queue := make(chan struct{}, 10)
	wg.Add(len(initialServices))
	var ss []*registry.Service

	if defaults.RuntimeIsCluster() {
		log.Logger(context.Background()).Info(fmt.Sprintf("Discovering %d services running on all peers... This can take some time.", len(initialServices)))
	}

	for _, s := range initialServices {
		queue <- struct{}{}
		go func(name string) {
			defer func() {
				<-queue
				wg.Done()
			}()
			sv, err := defaults.StartupRegistry().GetService(name)
			if err != nil {
				fmt.Printf("- Error on StartupRegistry.GetService for %s", name)
				return
			}
			if len(sv) == 0 {
				fmt.Println("- We should not be in there maintainRunningServicesList " + name)
				return
			}
			ss = append(ss, sv...)
		}(s.Name)
	}
	wg.Wait()

	for _, srv := range ss {
		//fmt.Printf("%s - Registering %d existing nodes for service %s\n", strings.Join(os.Args, "-"), len(srv.Nodes), srv.Name)
		for _, n := range srv.Nodes {
			c.GetPeer(n).Add(srv, fmt.Sprintf("%d", n.Port))
			c.registerProcessFromNode(n, srv.Name)
			defaults.Broker().Publish(common.TopicServiceRegistration, &broker.Message{
				Body: []byte(common.EventTypeServiceRegistered),
				Header: map[string]string{
					common.EventHeaderServiceRegisterService: srv.Name,
					common.EventHeaderServiceRegisterPeer:    fmt.Sprintf("%s:%d", n.Address, n.Port),
				},
			})
		}
	}

	go func() {

		// Once we've retrieved the list once, we watch the services
		w, err := defaults.Registry().Watch()
		if err != nil {
			return
		}
		for {
			res, err := w.Next()
			if err != nil {
				<-time.After(5 * time.Second)
				continue
			}

			if res == nil {
				continue
			}

			a := res.Action
			s := res.Service

			switch a {
			case "create":
				for _, n := range s.Nodes {
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
			case "delete":
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
			}
		}
	}()
}
