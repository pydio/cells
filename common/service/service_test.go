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
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"testing"
	"time"

	micro "github.com/micro/go-micro"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/server"
	"go.uber.org/zap"
	"go.uber.org/zap/zaptest"

	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/x/configx"
	. "github.com/smartystreets/goconvey/convey"
)

func init() {
	r := newMockRegistry()

	defaults.InitServer(func() server.Option {
		return server.Registry(r)
	})

	defaults.InitClient(func() client.Option {
		return client.Registry(r)
	})

	registry.DefaultRegistry = r

}

func TestServiceChildrenRunner(t *testing.T) {
	logger := zaptest.NewLogger(t)
	log.SetLoggerInit(func() *zap.Logger {
		return logger
	})

	Convey("Test registration of a new service", t, func() {
		if os.Args[len(os.Args)-1] == "parent.test" {
			go startChildService()
		} else {
			go startParentService()
		}

		// <-time.After(5 * time.Second)
	})
}

func startParentService() {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)

	s := NewService(
		Name("parent"),
		Context(ctx),
		WithMicro(func(m micro.Service) error {
			runner := NewChildrenRunner("parent", "parent.")
			m.Init(
				micro.BeforeStart(func() error {
					fmt.Println("before start")
					return nil
				}),
				micro.AfterStart(func() error {
					conf := configx.New()
					conf.Val("sources").Set([]string{"test"})

					runner.StartFromInitialConf(ctx, conf)

					return nil
				}),
				micro.BeforeStop(func() error {
					cancel()
					return nil
				}),
			)

			return nil
		}),
	)

	s.Start(ctx)
}

func startChildService() {

	ctx := context.Background()

	sigs := make(chan os.Signal)
	done := make(chan bool, 1)

	signal.Notify(sigs, syscall.SIGKILL)

	go func() {
		sig := <-sigs
		fmt.Println()
		fmt.Println(sig)
		done <- true
	}()

	s := NewService(
		Name("parent.test"),
		Context(ctx),
		WithMicro(func(m micro.Service) error {
			m.Init(
				micro.AfterStart(func() error {
					fmt.Println("The child test has started")

					return nil
				}),
				micro.BeforeStop(func() error {
					fmt.Println("The child test has stopped")

					return nil
				}),
			)

			return nil
		}),
	)

	s.Start(ctx)
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
