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
	"testing"

	"github.com/micro/go-micro/registry"
	// . "github.com/smartystreets/goconvey/convey"
)

func TestRegistry(t *testing.T) {
	// defaults.Init(
	// 	defaults.WithRegistry(newMockRegistry()),
	// )

	// Default = NewRegistry(
	// 	PollInterval(10 * time.Millisecond),
	// )

	// Convey("Test registration of a new service", t, func() {
	// 	err := Default.Register(&mockService{"test1", false, nil, []string{}, false})
	// 	So(err, ShouldBeNil)
	// })

	// Convey("Test Listing services", t, func() {
	// 	services, err := ListServices()
	// 	So(err, ShouldBeNil)
	// 	So(len(services), ShouldEqual, 1)
	// 	So(services[0].Name(), ShouldEqual, "test1")
	// })

	// Convey("Test Listing", t, func() {

	// 	services, err := ListRunningServices()
	// 	So(err, ShouldBeNil)
	// 	So(len(services), ShouldEqual, 0)

	// 	err = defaults.Registry().Register(&registry.Service{Name: "test2"})
	// 	So(err, ShouldBeNil)

	// 	// There s a delay
	// 	<-time.After(100 * time.Millisecond)

	// 	services, err = ListRunningServices()
	// 	So(err, ShouldBeNil)
	// 	So(len(services), ShouldEqual, 1)

	// })

	// Convey("Test Start Watcher", t, func() {

	// 	w, err := Watch()
	// 	So(err, ShouldBeNil)
	// 	defer w.Stop()

	// 	Convey("Test Watcher - start", func() {
	// 		go func() {
	// 			<-time.After(100 * time.Millisecond)
	// 			defaults.Registry().Register(&registry.Service{Name: "test3"})
	// 		}()

	// 		for {
	// 			m, err := w.Next()
	// 			So(err, ShouldBeNil)
	// 			So(m.Action, ShouldEqual, "started")

	// 			break
	// 		}
	// 	})

	// 	Convey("Test Watcher - delete", func() {
	// 		go func() {
	// 			<-time.After(100 * time.Millisecond)
	// 			defaults.Registry().Deregister(&registry.Service{Name: "test2"})
	// 			defaults.Registry().Deregister(&registry.Service{Name: "test3"})
	// 		}()

	// 		for {
	// 			m, err := w.Next()
	// 			So(err, ShouldBeNil)
	// 			So(m.Action, ShouldEqual, "stopped")

	// 			break
	// 		}
	// 	})
	// })

	// Convey("Test registration of a new service", t, func() {
	// 	err := Default.Deregister(&mockService{"test1", false, nil, []string{}, false})
	// 	So(err, ShouldBeNil)
	// })
}

type mockRegistry struct {
	services []*registry.Service
	c        chan *registry.Result
}

func newMockRegistry() *mockRegistry {
	m := &mockRegistry{}

	m.c = make(chan *registry.Result)

	return m
}

func (m *mockRegistry) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	m.services = append(m.services, s)
	// Non-blocking channel send
	select {
	case m.c <- &registry.Result{
		Action:  "create",
		Service: s,
	}:
	default:
	}
	return nil
}

// Deregister a service node
func (m *mockRegistry) Deregister(s *registry.Service) error {
	for k, ss := range m.services {
		if s.Name == ss.Name {
			m.services = append(m.services[:k], m.services[k+1:]...)
			break
		}
	}

	// Non-blocking channel send
	select {
	case m.c <- &registry.Result{
		Action:  "delete",
		Service: s,
	}:
	default:
	}
	return nil
}

// Retrieve a service. A slice is returned since we separate Name/Version.
func (m *mockRegistry) GetService(name string) ([]*registry.Service, error) {
	return nil, nil
}

// List the services. Only returns service names
func (m *mockRegistry) ListServices() ([]*registry.Service, error) {
	return m.services, nil
}

// Watch returns a watcher which allows you to track updates to the registry.
func (m *mockRegistry) Watch(opts ...registry.WatchOption) (registry.Watcher, error) {
	return &mockRegistryWatcher{m}, nil
}

func (m *mockRegistry) String() string {
	return "mock"
}

func (m *mockRegistry) Options() registry.Options {
	return registry.Options{}
}

type mockRegistryWatcher struct {
	m *mockRegistry
}

func (w *mockRegistryWatcher) Next() (*registry.Result, error) {
	res := <-w.m.c

	return res, nil
}

func (w *mockRegistryWatcher) Stop() {
	close(w.m.c)
}
