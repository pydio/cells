// Package memory provides an in-memory registry
package memory

import (
	"context"
	"sync"
	"time"

	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-micro/registry"
	"github.com/pborman/uuid"
)

type memoryRegistry struct {
	options registry.Options

	sync.RWMutex
	services map[string][]*registry.Service
	watchers map[string]*memoryWatcher
}

var (
	timeout = time.Millisecond * 10
)

func init() {
	cmd.DefaultRegistries["memory"] = NewRegistry
}

func (m *memoryRegistry) watch(r *registry.Result) {
	var watchers []*memoryWatcher

	m.RLock()
	for _, w := range m.watchers {
		watchers = append(watchers, w)
	}
	m.RUnlock()

	for _, w := range watchers {
		select {
		case <-w.exit:
			m.Lock()
			delete(m.watchers, w.id)
			m.Unlock()
		default:
			select {
			case w.res <- r:
			case <-time.After(timeout):
			}
		}
	}
}

func (m *memoryRegistry) Options() registry.Options {
	return m.options
}

func (m *memoryRegistry) GetService(service string) ([]*registry.Service, error) {
	m.RLock()
	s, ok := m.services[service]
	if !ok || len(s) == 0 {
		m.RUnlock()
		return nil, registry.ErrNotFound
	}
	m.RUnlock()
	return s, nil
}

func (m *memoryRegistry) ListServices() ([]*registry.Service, error) {
	m.RLock()
	var services []*registry.Service
	for _, service := range m.services {
		services = append(services, service...)
	}
	m.RUnlock()
	return services, nil
}

func (m *memoryRegistry) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	go m.watch(&registry.Result{Action: "update", Service: s})

	m.Lock()
	services := addServices(m.services[s.Name], []*registry.Service{s})
	m.services[s.Name] = services
	m.Unlock()
	return nil
}

func (m *memoryRegistry) Deregister(s *registry.Service) error {
	go m.watch(&registry.Result{Action: "delete", Service: s})

	m.Lock()
	services := delServices(m.services[s.Name], []*registry.Service{s})
	m.services[s.Name] = services
	m.Unlock()
	return nil
}

func (m *memoryRegistry) Watch(opts ...registry.WatchOption) (registry.Watcher, error) {
	var wo registry.WatchOptions
	for _, o := range opts {
		o(&wo)
	}

	w := &memoryWatcher{
		exit: make(chan bool),
		res:  make(chan *registry.Result),
		id:   uuid.NewUUID().String(),
		wo:   wo,
	}

	m.Lock()
	m.watchers[w.id] = w
	m.Unlock()
	return w, nil
}

func (m *memoryRegistry) String() string {
	return "memory"
}

func NewRegistry(opts ...registry.Option) registry.Registry {
	options := registry.Options{
		Context: context.Background(),
	}

	for _, o := range opts {
		o(&options)
	}

	services := getServices(options.Context)
	if services == nil {
		services = make(map[string][]*registry.Service)
	}

	return &memoryRegistry{
		options:  options,
		services: services,
		watchers: make(map[string]*memoryWatcher),
	}
}
