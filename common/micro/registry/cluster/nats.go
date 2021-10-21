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

package cluster

import (
	"context"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-plugins/registry/memory"
	nats "github.com/nats-io/nats.go"
	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"
)

type natsRegistry struct {
	local   registry.Registry
	cluster registry.Registry
	options registry.Options

	conn *nats.Conn

	sub           *nats.Subscription
	subRegister   *nats.Subscription
	subDeregister *nats.Subscription

	*sync.RWMutex
	watchers map[string]*clusterWatcher
}

func NewNATSRegistry(local registry.Registry, opts ...registry.Option) registry.Registry {
	options := registry.Options{
		Context: context.Background(),
	}

	for _, o := range opts {
		o(&options)
	}

	r := &natsRegistry{
		local:    local,
		cluster:  memory.NewRegistry(),
		options:  options,
		watchers: make(map[string]*clusterWatcher),
		RWMutex:  &sync.RWMutex{},
	}

	// Retrieving connection in goroutine
	go func() {
		conn, err := r.getConn()
		if err != nil {
			log.Warn("Could not get the nats connection", zap.Error(err))
		}

		r.conn = conn

		if err != r.initSubscription(conn) {
			log.Warn("Could not init subscriptions")
		}

		ticker := time.NewTicker(10 * time.Second)
		for {
			select {
			case <-ticker.C:
				if err := r.listServices(); err != nil {
					continue
				}
			}
		}
	}()

	return r
}

func (r *natsRegistry) Init(opts ...registry.Option) error {
	for _, o := range opts {
		o(&r.options)
	}

	return nil
}

func (r *natsRegistry) Options() registry.Options {
	return r.options
}

func (r *natsRegistry) register(s *registry.Service, opts ...registry.RegisterOption) error {
	if r.conn != nil && r.conn.IsConnected() {
		data, err := marshal(s)
		if err != nil {
			return err
		}

		if err := r.conn.Publish("registry.register", data); err != nil {
			return err
		}
	}

	return nil
}

func (r *natsRegistry) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	if err := r.register(s, opts...); err != nil {
		return err
	}

	return r.local.Register(s, opts...)
}

func (r *natsRegistry) deregister(s *registry.Service) error {
	if r.conn != nil && r.conn.IsConnected() {
		data, err := marshal(s)
		if err != nil {
			return err
		}
		if err := r.conn.Publish("registry.deregister", data); err != nil {
			return err
		}
	}

	return nil
}

func (r *natsRegistry) Deregister(s *registry.Service) error {
	if err := r.deregister(s); err != nil {
		return err
	}

	return r.local.Deregister(s)
}

func (r *natsRegistry) listServices() error {
	inbox := nats.NewInbox()
	if err := r.conn.PublishMsg(&nats.Msg{
		Subject: "registry.list",
		Reply:   inbox,
	}); err != nil {
		return err
	}

	sub, err := r.conn.SubscribeSync(inbox)
	if err != nil {
		return err
	}
	defer func() {
		if err := sub.Unsubscribe(); err != nil {
			log.Warn("[nats registry] could not unsubscribe list services listener")
		}
	}()

	cluster := memory.NewRegistry()

	for {
		m, err := sub.NextMsg(100 * time.Millisecond)
		if err != nil {
			break
		}

		var neu []*registry.Service
		if err := unmarshal(m.Data, &neu); err != nil {
			return err
		}

		for _, service := range neu {
			if err := cluster.Register(service); err != nil {
				log.Warn("[nats registry] could not register service from services list", zap.String("name", service.Name))
				continue
			}
		}
	}

	r.Lock()
	r.cluster = cluster
	r.Unlock()

	return nil
}

func (r *natsRegistry) GetService(name string) ([]*registry.Service, error) {
	r.RLock()
	defer r.RUnlock()

	clusterServices, err := r.cluster.GetService(name)
	if err != nil && err != registry.ErrNotFound {
		return nil, err
	}

	localServices, err := r.local.GetService(name)
	if err != nil {
		return nil, err
	}

	return mergeServices(localServices, clusterServices), nil
}

func (r *natsRegistry) ListServices() ([]*registry.Service, error) {
	r.RLock()
	defer r.RUnlock()

	clusterServices, err := r.cluster.ListServices()
	if err != nil && err != registry.ErrNotFound {
		return nil, err
	}

	localServices, err := r.local.ListServices()
	if err != nil {
		return nil, err
	}

	return mergeServices(localServices, clusterServices), nil
}

func (r *natsRegistry) Watch(opts ...registry.WatchOption) (registry.Watcher, error) {
	var wo registry.WatchOptions
	for _, o := range opts {
		o(&wo)
	}

	w := &clusterWatcher{
		exit: make(chan bool),
		res:  make(chan *registry.Result),
		id:   uuid.New().String(),
		wo:   wo,
	}

	localWatcher, err := r.local.Watch(opts...)
	if err != nil {
		return nil, err
	}
	go func() {
		for {
			res, err := localWatcher.Next()
			if err != nil {
				return
			}

			w.res <- res
		}
	}()

	r.Lock()
	r.watchers[w.id] = w
	r.Unlock()

	return w, nil
}

func (r *natsRegistry) String() string {
	return "nats"
}

func (r *natsRegistry) initSubscription(conn *nats.Conn) error {
	sub, err := conn.Subscribe("registry.list", func(m *nats.Msg) {
		// If we receive a connect message, we replay all services to communicate which services are registered with us
		services, err := r.local.ListServices()
		if err != nil {
			log.Warn("[nats registry] could not list local services")
			return
		}

		data, err := marshal(services)
		if err != nil {
			log.Warn("[nats registry] could not marshal services list")
			return
		}

		if err := conn.Publish(m.Reply, data); err != nil {
			log.Warn("[nats registry] could not reply services list")
			return
		}
	})
	if err != nil {
		return err
	}

	subRegister, err := conn.Subscribe("registry.register", func(m *nats.Msg) {
		var service *registry.Service
		if err := unmarshal(m.Data, &service); err != nil {
			log.Warn("[nats registry] could not unmarshal service", zap.String("name", service.Name))
			return
		}

		r.Lock()
		defer r.Unlock()
		if err := r.cluster.Register(service); err != nil {
			log.Warn("[nats registry] could not register service", zap.String("name", service.Name))
		}

		log.Debug("[nats registry] registered", zap.String("name", service.Name))
	})
	if err != nil {
		return err
	}

	subDeregister, err := conn.Subscribe("registry.deregister", func(m *nats.Msg) {
		var service *registry.Service
		if err := unmarshal(m.Data, &service); err != nil {
			log.Warn("[nats registry] could not unmarshal service", zap.String("name", service.Name))
			return
		}

		r.Lock()
		defer r.Unlock()
		if err := r.cluster.Deregister(service); err != nil {
			log.Warn("[nats registry] could not deregister service", zap.String("name", service.Name))
		}

		log.Debug("[nats registry] deregistered", zap.String("name", service.Name))
	})
	if err != nil {
		return err
	}

	r.sub = sub
	r.subRegister = subRegister
	r.subDeregister = subDeregister

	return nil
}

func (r *natsRegistry) getConn() (*nats.Conn, error) {
	if r.conn != nil {
		return r.conn, nil
	}

	conn, err := r.connect()
	if err != nil {
		return nil, err
	}

	return conn, nil
}

func (r *natsRegistry) connect() (*nats.Conn, error) {
	conn, err := nats.Connect(r.options.Addrs[0],
		nats.UseOldRequestStyle(),
		nats.RetryOnFailedConnect(true),
	)
	if err != nil {
		return nil, err
	}

	return conn, nil
}
