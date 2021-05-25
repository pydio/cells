package cluster

import (
	"bytes"
	"context"
	"encoding/gob"
	"fmt"
	"sync"
	"time"

	"go.uber.org/zap"

	jsm "github.com/nats-io/jsm.go"
	"github.com/pydio/cells/common/log"

	"github.com/micro/go-micro/registry"

	nats "github.com/nats-io/nats.go"

	"github.com/google/uuid"
)

var (
	timeout = 10 * time.Millisecond
)

var (
	defaultPeerTopic = "micro.registry.stan.peer"
)

type node struct {
	*registry.Node
	TTL      time.Duration
	LastSeen time.Time
}

type record struct {
	Name      string
	Version   string
	Metadata  map[string]string
	Nodes     map[string]*node
	Endpoints []*registry.Endpoint
}

type clusterRegistry struct {
	local registry.Registry

	options registry.Options

	connectTimeout time.Duration
	conn           *nats.Conn

	sync.RWMutex
	services map[string][]*registry.Service
	watchers map[string]*clusterWatcher
}

// NewRegistry returns an initialized in-memory registry
func NewRegistry(local registry.Registry, opts ...registry.Option) registry.Registry {
	options := registry.Options{
		Context: context.Background(),
	}
	for _, o := range opts {
		o(&options)
	}

	r := &clusterRegistry{
		local:    local,
		options:  options,
		services: make(map[string][]*registry.Service),
		watchers: make(map[string]*clusterWatcher),
	}

	clusterID, ok := options.Context.Value(clusterIDKey{}).(string)
	if !ok || len(clusterID) == 0 {
		clusterID = "cells"
	}

	clientID, ok := options.Context.Value(clientIDKey{}).(string)
	if !ok || len(clientID) == 0 {
		clientID = uuid.New().String()
	}

	// Trying to get the initial connection
	go func() {
		_, err := r.getConn(clientID)
		if err != nil {
			fmt.Println("Error ", err)
		}
	}()

	return r
}

func (r *clusterRegistry) watch(res *registry.Result) {
	var watchers []*clusterWatcher

	r.RLock()
	for _, w := range r.watchers {
		watchers = append(watchers, w)
	}
	r.RUnlock()

	for _, w := range watchers {
		select {
		case <-w.exit:
			r.Lock()
			delete(r.watchers, w.id)
			r.Unlock()
		default:
			select {
			case w.res <- res:
			case <-time.After(timeout):
			}
		}
	}
}

func (r *clusterRegistry) register(s *registry.Service) error {
	go r.watch(&registry.Result{Action: "update", Service: s})

	fmt.Println("Adding service ", s.Name)
	r.Lock()
	services := addServices(r.services[s.Name], []*registry.Service{s})
	r.services[s.Name] = services
	r.Unlock()
	return nil
}

func (r *clusterRegistry) deregister(s *registry.Service) error {
	go r.watch(&registry.Result{Action: "delete", Service: s})

	r.Lock()
	services := delServices(r.services[s.Name], []*registry.Service{s})
	r.services[s.Name] = services
	r.Unlock()
	return nil
}

func (r *clusterRegistry) getConn(clientID string) (*nats.Conn, error) {
	if r.conn != nil {
		return r.conn, nil
	}

	if err := r.connect(); err != nil {
		return nil, err
	}

	mgr, err := jsm.New(r.conn)
	if err != nil {
		return nil, err
	}

	stream, err := mgr.LoadOrNewStream("REGISTRY",
		jsm.Subjects("registry.*"),
		jsm.MemoryStorage(),
		jsm.MaxAge(10*time.Minute),
	)
	if err != nil {
		return nil, err
	}

	inbox := nats.NewInbox()

	r.conn.Subscribe(inbox, func(m *nats.Msg) {
		var service *registry.Service
		if err := unmarshal(m.Data, &service); err != nil {
			return
		}

		switch m.Subject {
		case "registry.register":
			r.register(service)
		case "registry.deregister":
			r.deregister(service)
		}

		m.Ack()
	})

	if _, err := stream.LoadOrNewConsumer(
		"registry-"+uuid.New().String(),
		jsm.DeliverySubject(inbox),
		jsm.DeliverAllAvailable(),
	); err != nil {
		return nil, err
	}

	return r.conn, nil
}

func (r *clusterRegistry) connect() error {
	timeout := make(<-chan time.Time)

	r.RLock()
	if r.connectTimeout > 0 {
		timeout = time.After(r.connectTimeout)
	}
	r.RUnlock()

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	fn := func() error {
		conn, err := nats.Connect(r.options.Addrs[0],
			nats.UseOldRequestStyle(),
			//nats.DisconnectErrHandler()
		)
		if err != nil {
			return err
		}

		r.conn = conn
		return nil
	}

	// don't wait for first try
	if err := fn(); err == nil {
		return nil
	}

	// wait loop
	for {
		select {
		// context closed
		case <-r.options.Context.Done():
			return nil
		//  in case of timeout fail with a timeout error
		case <-timeout:
			return fmt.Errorf("[stan]: timeout connect to %v", r.options.Addrs[0])
		// got a tick, try to connect
		case <-ticker.C:
			err := fn()
			if err == nil {
				log.Info("Now connected to the cluster", zap.String("addr", r.options.Addrs[0]))
				return nil
			}
		}
	}

	return nil
}

func (r *clusterRegistry) Init(opts ...registry.Option) error {
	for _, o := range opts {
		o(&r.options)
	}

	return nil
}

func (r *clusterRegistry) Options() registry.Options {
	return r.options
}

func (r *clusterRegistry) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	if r.conn != nil {
		data, err := marshal(s)
		if err != nil {
			return err
		}

		if err := r.conn.Publish("registry.register", data); err != nil {
			return err
		}
	}

	return r.local.Register(s, opts...)
}

func (r *clusterRegistry) Deregister(s *registry.Service) error {
	if r.conn != nil {
		data, err := marshal(s)
		if err != nil {
			return err
		}
		if err := r.conn.Publish("registry.deregister", data); err != nil {
			return err
		}
	}

	return r.local.Deregister(s)
}

func (r *clusterRegistry) GetService(name string) ([]*registry.Service, error) {
	localServices, err := r.local.GetService(name)
	if err != nil {
		return nil, err
	}

	clusterServices, ok := r.services[name]
	if !ok {
		return localServices, nil
	}

	return mergeServices(localServices, clusterServices), nil
}

func (r *clusterRegistry) ListServices() ([]*registry.Service, error) {
	localServices, err := r.local.ListServices()
	if err != nil {
		return nil, err
	}

	var clusterServices []*registry.Service
	for _, ss := range r.services {
		clusterServices = append(clusterServices, ss...)
	}

	return mergeServices(localServices, clusterServices), nil
}

func (r *clusterRegistry) Watch(opts ...registry.WatchOption) (registry.Watcher, error) {
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

func (r *clusterRegistry) String() string {
	return "cluster"
}

func marshal(v interface{}) ([]byte, error) {
	b := new(bytes.Buffer)
	err := gob.NewEncoder(b).Encode(v)
	if err != nil {
		return nil, err
	}
	return b.Bytes(), nil
}

func unmarshal(data []byte, v interface{}) error {
	b := bytes.NewBuffer(data)
	return gob.NewDecoder(b).Decode(v)
}
