package cluster

import (
	"bytes"
	"context"
	"encoding/gob"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/micro/go-plugins/registry/memory"

	jsm "github.com/nats-io/jsm.go"

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

	clientID string

	connectTimeout time.Duration
	conn           *nats.Conn

	consumerInbox string

	jsmAvailable bool
	mgr          *jsm.Manager
	stream       *jsm.Stream
	sub          *nats.Subscription
	consumer     *jsm.Consumer

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
		local:         local,
		clusterNodes:  make(map[string]registry.Registry),
		clientID:      clientID,
		options:       options,
		watchers:      make(map[string]*clusterWatcher),
		consumerInbox: nats.NewInbox(),
	}

	// Trying to get the initial connection
	go func() {
		conn, err := r.getConn()
		if err != nil {
			fmt.Println("Error ", err)
			return
		}
		r.conn = conn

		mgr, err := jsm.New(conn)
		if err != nil {
			return
		}
		r.mgr = mgr

		ticker := time.NewTicker(10 * time.Second)
		for {
			select {
			case <-ticker.C:
				err := r.initJetStream(conn)
				if err != nil {
					continue
				}

				// In all cases, we check that the connection to all consumers is correct
				var consumerIDs []string
				if err := r.stream.EachConsumer(func(con *jsm.Consumer) {
					consumerIDs = append(consumerIDs, con.Name())
				}); err != nil {
					r.reset()
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

	conn, err := r.connect()
	if err != nil {
		return nil, err
	}

	return conn, nil
}

func (r *clusterRegistry) initSubscription(conn *nats.Conn, mgr *jsm.Manager, stream *jsm.Stream) (*nats.Subscription, error) {
	sub, err := conn.Subscribe(r.consumerInbox, func(m *nats.Msg) {

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
	if err != nil {
		return nil, err
	}

	return sub, nil
}

func (r *clusterRegistry) initJetStream(conn *nats.Conn) error {
	available := r.mgr.IsJetStreamEnabled()

	// If the jetstream isn't available, then reset and carry on
	if !available {
		r.reset()
		r.jsmAvailable = false
		return errors.New("jetstream is not available")
	}

	if r.jsmAvailable {
		return nil
	}

	if r.stream == nil {
		stream, err := r.initJetStreamStream(r.mgr)
		if err != nil {
			return err
		}
		r.stream = stream
	}

	if r.sub == nil || !r.sub.IsValid() {
		sub, err := r.initSubscription(conn, r.mgr, r.stream)
		if err != nil {
			return err
		}
		r.sub = sub
	}

	if r.consumer == nil {
		consumer, err := r.initJetStreamConsumer(r.mgr, r.stream)
		if err != nil {
			fmt.Println("We have an error here ", err)
			return err
		}
		r.consumer = consumer
	}

	// If the jetstream wasn't available before
	if !r.jsmAvailable {
		r.jsmAvailable = true
		r.replay()
	}

	return nil
}

func (r *clusterRegistry) initJetStreamStream(mgr *jsm.Manager) (*jsm.Stream, error) {
	stream, err := mgr.LoadOrNewStream("REGISTRY",
		jsm.Subjects("registry.*"),
		jsm.MemoryStorage(),
		jsm.MaxAge(10*time.Minute),
	)
	if err != nil {
		fmt.Println("We have a problem loading stream ", err)
		return nil, err
	}

	return stream, err
}

func (r *clusterRegistry) initJetStreamConsumer(mgr *jsm.Manager, stream *jsm.Stream) (*jsm.Consumer, error) {
	con, err := stream.LoadOrNewConsumer(
		"registry-"+uuid.New().String(),
		jsm.DeliverySubject(r.consumerInbox),
		jsm.DeliverAllAvailable(),
		jsm.AcknowledgeAll(),
	)
	if err != nil {
		fmt.Println("We have a problem loading consumer ", err)
		return nil, err
	}

	return con, nil
}

func (r *clusterRegistry) connect() (*nats.Conn, error) {
	conn, err := nats.Connect(r.options.Addrs[0],
		nats.UseOldRequestStyle(),
		nats.ReconnectHandler(func(conn *nats.Conn) {
			if r.conn != nil {
				r.initJetStream(conn)
			}
		}),
		nats.DisconnectErrHandler(func(_ *nats.Conn, _ error) {
			r.reset()
		}),
		nats.RetryOnFailedConnect(true),
	)
	if err != nil {
		return nil, err
	}

	return conn, nil
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

func (r *clusterRegistry) replay() error {
	if r.conn != nil {
		services, err := r.local.ListServices()
		if err != nil {
			return err
		}

		for _, service := range services {
			if err := r.register(service); err != nil {
				return err
			}
		}
	}

	return nil
}

func (r *clusterRegistry) reset() error {
	r.clusterNodes = make(map[string]registry.Registry)

	return nil
}

func (r *clusterRegistry) register(s *registry.Service, opts ...registry.RegisterOption) error {
	if r.conn != nil && r.consumer != nil {
		meta := make(map[string]string)
		for k, v := range s.Metadata {
			meta[k] = v
		}
		meta["consumerID"] = r.consumer.Name()

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
	if r.conn != nil && r.consumer != nil {
		meta := make(map[string]string)
		for k, v := range s.Metadata {
			meta[k] = v
		}
		meta["consumerID"] = r.consumer.Name()

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
