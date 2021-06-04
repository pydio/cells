package cluster

import (
	"bytes"
	"context"
	"encoding/gob"
	"fmt"
	"sync"
	"time"

	"github.com/micro/go-plugins/registry/memory"

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

type clusterRegistry struct {
	local        registry.Registry
	clusterNodes map[string]registry.Registry

	options registry.Options

	consumerID string
	clientID   string

	connectTimeout time.Duration
	conn           *nats.Conn

	sync.RWMutex
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

	clientID, ok := options.Context.Value(clientIDKey{}).(string)
	if !ok || len(clientID) == 0 {
		clientID = uuid.New().String()
	}

	r := &clusterRegistry{
		local:        local,
		clusterNodes: make(map[string]registry.Registry),
		clientID:     clientID,
		options:      options,
		watchers:     make(map[string]*clusterWatcher),
	}

	// Trying to get the initial connection
	go func() {
		_, err := r.getConn()
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

func (r *clusterRegistry) getConn() (*nats.Conn, error) {
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

	go func() {
		ticker := time.NewTicker(10 * time.Second)
		for {
			select {
			case <-ticker.C:
				var consumerIDs []string
				if err := stream.EachConsumer(func(con *jsm.Consumer) {
					consumerIDs = append(consumerIDs, con.Name())
				}); err != nil {
					continue
				}

				for k := range r.clusterNodes {
					found := false
					for _, consumerID := range consumerIDs {
						if k == consumerID {
							found = true
							break
						}
					}

					if !found {
						delete(r.clusterNodes, k)
					}
				}

			}
		}
	}()

	inbox := nats.NewInbox()

	r.conn.Subscribe(inbox, func(m *nats.Msg) {

		var service *registry.Service
		if err := unmarshal(m.Data, &service); err != nil {
			return
		}

		consumerID := service.Metadata["consumerID"]

		known, err := mgr.IsKnownConsumer(stream.Name(), consumerID)
		if err != nil || !known {
			return
		}

		clusterNode, ok := r.clusterNodes[consumerID]
		if !ok {
			clusterNode = memory.NewRegistry()
			r.clusterNodes[consumerID] = clusterNode
		}

		switch m.Subject {
		case "registry.register":
			clusterNode.Register(service)
		case "registry.deregister":
			clusterNode.Deregister(service)
		}

		m.Ack()
	})

	con, err := stream.LoadOrNewConsumer(
		"registry-"+uuid.New().String(),
		jsm.DeliverySubject(inbox),
		jsm.DeliverAllAvailable(),
		jsm.AcknowledgeAll(),
	)
	if err != nil {
		return nil, err
	}

	r.consumerID = con.Name()
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

	replay := func() error {
		ss, err := r.local.ListServices()
		if err != nil {
			return err
		}

		for _, s := range ss {
			if err := r.register(s); err != nil {
				return err
			}
		}

		return nil
	}

	fn := func() error {
		conn, err := nats.Connect(r.options.Addrs[0],
			nats.UseOldRequestStyle(),
			nats.ReconnectHandler(func(_ *nats.Conn) {
				fmt.Println("Reconnected to nats")
				replay()
			}),
			nats.DisconnectErrHandler(func(_ *nats.Conn, _ error) {
				fmt.Println("Disconnected from nats")
				r.clusterNodes = make(map[string]registry.Registry)
			}),
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
				replay()
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

func (r *clusterRegistry) register(s *registry.Service, opts ...registry.RegisterOption) error {
	if r.conn != nil {
		meta := make(map[string]string)
		for k, v := range s.Metadata {
			meta[k] = v
		}
		meta["consumerID"] = r.consumerID

		s.Metadata = meta

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

func (r *clusterRegistry) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	if err := r.register(s, opts...); err != nil {
		return err
	}

	return r.local.Register(s, opts...)
}

func (r *clusterRegistry) deregister(s *registry.Service) error {
	if r.conn != nil {
		meta := make(map[string]string)
		for k, v := range s.Metadata {
			meta[k] = v
		}
		meta["consumerID"] = r.consumerID

		s.Metadata = meta

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

func (r *clusterRegistry) Deregister(s *registry.Service) error {
	if err := r.deregister(s); err != nil {
		return err
	}

	return r.local.Deregister(s)
}

func (r *clusterRegistry) GetService(name string) ([]*registry.Service, error) {
	localServices, errLocal := r.local.GetService(name)
	if errLocal != nil && errLocal != registry.ErrNotFound {
		return []*registry.Service{}, errLocal
	}

	var clusterServices []*registry.Service
	for _, clusterNode := range r.clusterNodes {
		services, errCluster := clusterNode.GetService(name)
		if errCluster != nil {
			return localServices, errLocal
		}

		clusterServices = mergeServices(clusterServices, services)
	}

	return mergeServices(localServices, clusterServices), nil
}

func (r *clusterRegistry) ListServices() ([]*registry.Service, error) {
	localServices, errLocal := r.local.ListServices()
	if errLocal != nil && errLocal != registry.ErrNotFound {
		return nil, errLocal
	}

	var clusterServices []*registry.Service
	for _, clusterNode := range r.clusterNodes {
		services, errCluster := clusterNode.ListServices()
		if errCluster != nil {
			return localServices, errLocal
		}

		clusterServices = mergeServices(clusterServices, services)
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
