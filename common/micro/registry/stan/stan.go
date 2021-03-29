// Package nats provides a NATS registry using broadcast queries
package stan

import (
	"context"
	"encoding/json"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-micro/registry"
	"github.com/nats-io/nats"
	stan "github.com/nats-io/stan.go"
)

type stanRegistry struct {
	addrs []string
	opts  registry.Options
	nopts []stan.Option

	sync.RWMutex
	conn stan.Conn

	connectTimeout time.Duration
	connectRetry   bool

	services       map[string][]*registry.Service
	servicesLock *sync.RWMutex

	watchers map[string]chan*PeerEvent
	watcherLock *sync.RWMutex
}

var (
	defaultPeerTopic = "micro.registry.stan.peer"
)

type PeerEventType int

const (
	PeerEventType_REGISTER PeerEventType = iota
	PeerEventType_DEREGISTER
)

type PeerEvent struct {
	Service *registry.Service
	Type    PeerEventType
}

func init() {
	cmd.DefaultRegistries["nats"] = NewRegistry
}

func setAddrs(addrs []string) []string {
	var cAddrs []string
	for _, addr := range addrs {
		if len(addr) == 0 {
			continue
		}
		if !strings.HasPrefix(addr, "nats://") {
			addr = "nats://" + addr
		}
		cAddrs = append(cAddrs, addr)
	}
	if len(cAddrs) == 0 {
		cAddrs = []string{nats.DefaultURL}
	}
	return cAddrs
}

func (n *stanRegistry) watch() error {
	watcher, err := n.Watch()
	if err != nil {
		return err
	}

	defer watcher.Stop()

	for {
		ev, err := watcher.Next()
		if err != nil {
			time.Sleep(1 * time.Second)
			continue
		}

		service := ev.Service
		name := service.Name
		if ev.Action == "create" {
			n.servicesLock.Lock()
			n.services[name] = addServices(n.services[name], []*registry.Service{service})
			n.servicesLock.Unlock()
		} else if ev.Action == "delete" {
			n.servicesLock.Lock()
			n.services[name] = delServices(n.services[name], []*registry.Service{service})
			n.servicesLock.Unlock()
		}
	}
}

func (n *stanRegistry) newConn() (stan.Conn, error) {
	opts := n.nopts

	conn, err := stan.Connect("cells", uuid.New().String(), opts...)
	if err != nil {
		return nil, err
	}

	msgCh := make(chan *PeerEvent)

	go n.watch()

	// Watching all events since the beginning of time
	conn.Subscribe(defaultPeerTopic, func(m *stan.Msg) {
		ev := &PeerEvent{}

		if err := json.Unmarshal(m.Data, ev); err != nil {
			return
		}

		msgCh <- ev
	}, stan.DeliverAllAvailable())

	go func() {
		for {
			select {
			case ev := <-msgCh:
				n.watcherLock.RLock()
				for _, watcher := range n.watchers {
					watcher <- ev
				}
				n.watcherLock.RUnlock()
			}
		}
	}()

	return conn, nil
}

func (n *stanRegistry) getConn() (stan.Conn, error) {
	n.Lock()
	defer n.Unlock()

	if n.conn != nil {
		return n.conn, nil
	}

	c, err := n.newConn()
	if err != nil {
		return nil, err
	}

	n.conn = c

	return n.conn, nil
}

func (n *stanRegistry) Options() registry.Options {
	return n.opts
}

func (n *stanRegistry) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	conn, err := n.getConn()
	if err != nil {
		return err
	}

	n.Lock()
	defer n.Unlock()

	data, err := json.Marshal(&PeerEvent{
		Service: s,
		Type:    PeerEventType_REGISTER,
	})

	if err != nil {
		return err
	}

	// Sending a log to make everybody aware
	if err := conn.Publish(defaultPeerTopic, data); err != nil {
		return err
	}

	return nil
}

func (n *stanRegistry) Deregister(s *registry.Service) error {
	conn, err := n.getConn()
	if err != nil {
		return err
	}

	n.Lock()
	defer n.Unlock()

	data, err := json.Marshal(&PeerEvent{
		Service: s,
		Type:    PeerEventType_DEREGISTER,
	})

	if err != nil {
		return err
	}

	// Sending a log to make everybody aware
	if err := conn.Publish(defaultPeerTopic, data); err != nil {
		return err
	}

	return nil
}

func (n *stanRegistry) GetService(s string) ([]*registry.Service, error) {

	n.servicesLock.RLock()
	servicesMap := n.services[s]
	n.servicesLock.RUnlock()

	var services []*registry.Service
	for _, service := range servicesMap {
		if service.Name == s {
			services = append(services, service)
		}
	}
	return services, nil
}

func (n *stanRegistry) ListServices() ([]*registry.Service, error) {
	n.servicesLock.RLock()
	servicesMap := n.services
	n.servicesLock.RUnlock()

	var services []*registry.Service
	for _, v := range servicesMap {
		services = append(services, v...)
	}
	return services, nil
}

func (n *stanRegistry) Watch(opts ...registry.WatchOption) (registry.Watcher, error) {
	id := uuid.New().String()
	msgCh := make(chan *PeerEvent)

	n.watcherLock.Lock()
	n.watchers[id] = msgCh
	n.watcherLock.Unlock()

	var wo registry.WatchOptions
	for _, o := range opts {
		o(&wo)
	}

	return &stanWatcher{msgCh, wo}, nil
}

func (n *stanRegistry) String() string {
	return "stan"
}

func NewRegistry(opts ...registry.Option) registry.Registry {
	options := registry.Options{
		Timeout: time.Millisecond * 100,
		Context: context.Background(),
	}

	for _, o := range opts {
		o(&options)
	}

	stanOptions := []stan.Option{}
	if n, ok := options.Context.Value(optionsKey{}).([]stan.Option); ok {
		stanOptions = n
	}

	// queryTopic := defaultQueryTopic
	// if qt, ok := options.Context.Value(queryTopicKey{}).(string); ok {
	// 	queryTopic = qt
	// }

	// watchTopic := defaultWatchTopic
	// if wt, ok := options.Context.Value(watchTopicKey{}).(string); ok {
	// 	watchTopic = wt
	// }

	// // registry.Options have higher priority than nats.Options
	// // only if Addrs, Secure or TLSConfig were not set through a registry.Option
	// // we read them from nats.Option
	// if len(options.Addrs) == 0 {
	// 	options.Addrs = stanOptions.Servers
	// }

	// if !options.Secure {
	// 	options.Secure = stanOptions.Secure
	// }

	// if options.TLSConfig == nil {
	// 	options.TLSConfig = stanOptions.TLSConfig
	// }

	// check & add nats:// prefix (this makes also sure that the addresses
	// stored in natsRegistry.addrs and options.Addrs are identical)
	options.Addrs = setAddrs(options.Addrs)

	n :=  &stanRegistry{
		addrs: options.Addrs,
		opts:  options,
		nopts: stanOptions,
		// queryTopic: queryTopic,
		// watchTopic: watchTopic,
		services: make(map[string][]*registry.Service),
		servicesLock: &sync.RWMutex{},
		watchers: make(map[string]chan*PeerEvent),
		watcherLock : &sync.RWMutex{},
	}

	n.getConn()

	return n
}
