package cluster

import (
	"context"
	"fmt"
	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"
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

type clusterRegistry struct {
	local        registry.Registry
	nats         registry.Registry
	nodes        map[string]registry.Registry

	options registry.Options

	clientID string

	connectTimeout time.Duration
	conn           *nats.Conn

	consumerInbox string

	mgr          *jsm.Manager
	stream       *jsm.Stream
	sub          *nats.Subscription
	consumer     *jsm.Consumer

	cancelNats context.CancelFunc

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
		nodes:         make(map[string]registry.Registry),
		clientID:      clientID,
		options:       options,
		watchers:      make(map[string]*clusterWatcher),
		consumerInbox: nats.NewInbox(),
	}

	// Trying to get the initial connection
	go func() {
		conn, err := r.getConn()
		if err != nil {
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
			if !r.conn.IsConnected() {
				if err := r.reset(); err != nil {
					log.Warn("[nats cluster] error during reset ", zap.Error(err))
				}
				time.Sleep(10 * time.Second)
				continue
			}

			if !r.mgr.IsJetStreamEnabled() {
				log.Info("[nats cluster] jetstream is not available")

				if err := r.reset(); err != nil {
					log.Warn("[nats cluster] error during reset ", zap.Error(err))
				}

				// We're connected but the jetstream is not yet available - start using a simple nats if we don't already
				r.enableSimpleNATS(opts...)

				// We should wait for a reconnection to nats
				time.Sleep(10 * time.Second)
				continue
			}

			log.Info("[nats cluster] jetstream is enabled")

			// Making sure the consumer, stream and subscription are loaded
			err := r.initJetStream(conn)
			if err != nil {
				log.Warn("[nats cluster] waiting for the jetstream connection to open", zap.Error(err))
				time.Sleep(5 * time.Second)
				continue
			}

			r.disableSimpleNATS()

			log.Info("[nats cluster] jetstream init complete")

			// In all cases, we check that the connection to all consumers is correct
			var consumerIDs []string
			if err := r.stream.EachConsumer(func(con *jsm.Consumer) {
				consumerIDs = append(consumerIDs, con.Name())
			}); err != nil {
				if err := r.reset(); err != nil {
					log.Warn("[nats cluster] error retrieving consumers ", zap.Error(err))
				}

				time.Sleep(1* time.Second)
				continue
			}

			// Making sure old nodes are deleted
			for k := range r.nodes {
				found := false
				for _, consumerID := range consumerIDs {
					if k == consumerID {
						found = true
						break
					}
				}

				if !found {
					delete(r.nodes, k)
				}
			}

			select {
			case <-ticker.C:
				continue
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

		clusterNode, ok := r.nodes[consumerID]
		if !ok {
			clusterNode = memory.NewRegistry()
			r.Lock()
			r.nodes[consumerID] = clusterNode
			r.Unlock()
		}

		switch m.Subject {
		case "registry.register":
			if err := clusterNode.Register(service); err != nil {
				log.Warn("[nats cluster] could not register service", zap.String("name", service.Name))
			}
		case "registry.deregister":
			if err := clusterNode.Deregister(service); err != nil {
				log.Warn("[nats cluster] could not deregister service", zap.String("name", service.Name))
			}
		}

		m.Ack()
	})
	if err != nil {
		return nil, err
	}

	return sub, nil
}

func (r *clusterRegistry) initJetStream(conn *nats.Conn) error {
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
			return err
		}
		r.consumer = consumer

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
		return nil, err
	}

	return con, nil
}

func (r *clusterRegistry) connect() (*nats.Conn, error) {
	conn, err := nats.Connect(r.options.Addrs[0],
		nats.UseOldRequestStyle(),
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

func (r *clusterRegistry) enableSimpleNATS(opts ...registry.Option) {
	if r.nats != nil {
		return
	}
	// Adding a context to be able to stop the nats in case we need to
	// opts = append(opts, registry.)
	_, cancel := context.WithCancel(r.options.Context)
	r.cancelNats = cancel
	r.nats = NewNATSRegistry(r.local, opts...)
}

func (r *clusterRegistry) disableSimpleNATS() {
	if r.nats == nil {
		return
	}
	if r.cancelNats != nil {
		r.cancelNats()
	}
	r.cancelNats = nil
	r.nats = nil
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
		fmt.Println("[nats cluster] Replaying")
		services, err := r.local.ListServices()
		if err != nil {
			return err
		}

		for _, service := range services {
			if err := r.Register(service); err != nil {
				return err
			}
		}
	}

	return nil
}

func (r *clusterRegistry) reset() error {
	r.Lock()
	defer r.Unlock()
	r.nodes = make(map[string]registry.Registry)
	r.stream = nil
	r.consumer = nil
	if r.sub != nil {
		if err :=  r.sub.Unsubscribe(); err != nil {
			return err
		}

		r.sub = nil
	}

	return nil
}

func (r *clusterRegistry) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	if r.nats != nil {
		return r.nats.Register(s, opts...)
	}

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

	return r.local.Register(s, opts...)
}

func (r *clusterRegistry) Deregister(s *registry.Service) error {
	if r.nats != nil {
		return r.nats.Deregister(s)
	}

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

	return r.local.Deregister(s)
}

func (r *clusterRegistry) GetService(name string) ([]*registry.Service, error) {
	// If we have a nats, jetstream is not available and we need to leave it to the nats registry
	if r.nats != nil {
		return r.nats.GetService(name)
	}

	localServices, errLocal := r.local.GetService(name)
	if errLocal != nil && errLocal != registry.ErrNotFound {
		return []*registry.Service{}, errLocal
	}

	var clusterServices []*registry.Service
	for _, clusterNode := range r.nodes {
		services, errCluster := clusterNode.GetService(name)
		if errCluster != nil {
			return localServices, errLocal
		}

		clusterServices = mergeServices(clusterServices, services)
	}

	return mergeServices(localServices, clusterServices), nil
}

func (r *clusterRegistry) ListServices() ([]*registry.Service, error) {
	// If we have a nats, jetstream is not available and we need to leave it to the nats registry
	if r.nats != nil {
		return r.nats.ListServices()
	}

	localServices, errLocal := r.local.ListServices()
	if errLocal != nil && errLocal != registry.ErrNotFound {
		return nil, errLocal
	}

	var clusterServices []*registry.Service
	for _, clusterNode := range r.nodes {
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
