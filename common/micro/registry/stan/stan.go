// Package nats provides a NATS registry using broadcast queries
package stan

import (
	"bytes"
	"context"
	"encoding/gob"
	"fmt"
	"log"
	"math/rand"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-micro/registry"
	"github.com/nats-io/jsm.go"
	"github.com/nats-io/nats.go"
	stan "github.com/nats-io/stan.go"
)

type stanRegistry struct {
	addrs []string
	opts  registry.Options
	nopts []stan.Option

	clusterID string
	clientID  string

	*sync.RWMutex
	conn *nats.Conn

	connectTimeout time.Duration
	connectRetry   bool

	services     map[string][]*registry.Service
	servicesLock *sync.RWMutex

	watchers    map[string]chan *PeerEvent
	watcherLock *sync.RWMutex

	exit chan struct{}

	stream *jsm.Stream
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
			return err
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

func (n *stanRegistry) reconnectCB(c stan.Conn, err error) {
	if n.connectRetry {
		if err := n.connect(); err != nil {
			log.Print(err)
		}
	}
}

func (n *stanRegistry) replayMessages() error {
	con, err := n.stream.NewConsumer(
		jsm.StartAtTimeDelta(10*time.Minute),
		jsm.AcknowledgeNone(),
		// jsm.AcknowledgeExplicit(),
		jsm.DurableName("REPLAY-" +uuid.New().String()),
	)
	if err != nil {
		return err
	}

	num, _ := con.PendingMessages()

	for i := 0; i < int(num); i++ {
		msg, err := con.NextMsg()
		if err != nil {
			continue
		}

		ev := &PeerEvent{}

		if err := unmarshal(msg.Data, ev); err != nil {
			continue
		}

		for _, watcher := range n.watchers {
			watcher <- ev
		}
	}

	return con.Delete()
}

func (n *stanRegistry) liveReplay() error {
	_, err := n.conn.Subscribe(defaultPeerTopic, func (msg *nats.Msg) {
		ev := &PeerEvent{}

		if err := unmarshal(msg.Data, ev); err != nil {
			return
		}

		for _, watcher := range n.watchers {
			watcher <- ev
		}
	})
	if err != nil {
		return err
	}

	return nil
}

func (n *stanRegistry) connect() error {
	timeout := make(<-chan time.Time)

	n.RLock()
	if n.connectTimeout > 0 {
		timeout = time.After(n.connectTimeout)
	}
	n.RUnlock()

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	fn := func() error {
		conn, err := nats.Connect(n.addrs[0], nats.UseOldRequestStyle())
		if err != nil {
			return err
		}

		n.conn = conn
		return nil
	}

	// don't wait for first try
	if err := fn(); err == nil {
		fmt.Println("Returning with a connection")
		return nil
	}

	// wait loop
	for {
		select {
		// context closed
		case <-n.opts.Context.Done():
			return nil
		//  in case of timeout fail with a timeout error
		case <-timeout:
			return fmt.Errorf("[stan]: timeout connect to %v", n.addrs)
		// got a tick, try to connect
		case <-ticker.C:
			err := fn()
			if err == nil {
				fmt.Printf("[stan]: successful connection to %v\n", n.addrs)
				return nil
			}
			fmt.Printf("[stan]: failed to connect %v: %v\n", n.addrs, err)
		}
	}

	return nil
}

func (n *stanRegistry) getConn() (*nats.Conn, error) {
	if n.conn != nil {
		return n.conn, nil
	}

	if err := n.connect(); err != nil {
		return nil, err
	}

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

	o := new(registry.RegisterOptions)
	for _, opt := range opts {
		opt(o)
	}

	n.Lock()
	defer n.Unlock()

	// Adding time as a string metadata for the nodes
	for _, node := range s.Nodes {
		// Adding twice the ttl to make sure we don't have any false positive
		data, _ := time.Now().Add(o.TTL * 2).MarshalText()
		node.Metadata["expiry"] = string(data)
	}

	data, err := marshal(&PeerEvent{
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

	data, err := marshal(&PeerEvent{
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
	defer n.servicesLock.RUnlock()

	servicesMap := n.services[s]

	var services []*registry.Service
	for _, service := range servicesMap {
		if service.Name == s {
			// Check expiry
			nodes, _ := n.checkExpiredNodes(service)

			if len(nodes) == 0 {
				continue
			}

			service.Nodes = nodes
			services = append(services, service)
		}
	}
	return services, nil
}

func (n *stanRegistry) checkExpiredNodes(service *registry.Service) (valid []*registry.Node, expired []*registry.Node) {
	for _, node := range service.Nodes {
		if node == nil {
			continue
		}
		t := new(time.Time)

		err := t.UnmarshalText([]byte(node.Metadata["expiry"]))
		if err != nil || t.After(time.Now()) {
			// If we can't read the expiry or the expiry is not reached, then we consider it as valid
			valid = append(valid, node)
		} else {
			fmt.Println("node is expired ", node, t, time.Now())
			expired = append(expired, node)
		}
	}

	if len(expired) > 0 {
		n.Deregister(&registry.Service{
			Name:     service.Name,
			Version:  service.Version,
			Nodes:    expired,
			Metadata: service.Metadata,
		})
	}

	return
}

func (n *stanRegistry) ListServices() ([]*registry.Service, error) {
	n.servicesLock.RLock()
	defer n.servicesLock.RUnlock()

	servicesMap := n.services

	var services []*registry.Service
	for _, v := range servicesMap {
		for _, service := range v {
			// Check expiry
			nodes, _ := n.checkExpiredNodes(service)

			if len(nodes) == 0 {
				continue
			}

			service.Nodes = nodes

			services = append(services, service)
		}
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

	clusterID, ok := options.Context.Value(clusterIDKey{}).(string)
	if !ok || len(clusterID) == 0 {
		log.Fatal("must specify ClusterID Option")
	}

	clientID, ok := options.Context.Value(clientIDKey{}).(string)
	if !ok || len(clientID) == 0 {
		clientID = uuid.New().String()
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

	n := &stanRegistry{
		RWMutex:      &sync.RWMutex{},
		addrs:        options.Addrs,
		opts:         options,
		nopts:        stanOptions,
		clientID:     clientID,
		clusterID:    clusterID,
		services:     make(map[string][]*registry.Service),
		servicesLock: &sync.RWMutex{},
		watchers:     make(map[string]chan *PeerEvent),
		watcherLock:  &sync.RWMutex{},
		exit:         make(chan struct{}, 1),
	}

	// Trying to get the initial
	n.getConn()

	mgr, _ := jsm.New(n.conn)

	for {
		if mgr.IsJetStreamEnabled() {
			break
		}

		time.Sleep(1 * time.Second)
	}

	fmt.Println("Loading the stream ? ")

	stream, err2 := mgr.LoadOrNewStream("PEERS", jsm.Subjects(defaultPeerTopic), jsm.MaxAge(10*time.Minute), jsm.FileStorage())
	if err2 != nil {
		return nil
	}

	info, _ := stream.LatestInformation()
	fmt.Println("The leader is ? ", info.Cluster.Leader, stream.Name(), stream.)
	n.stream = stream

	go n.watch()

	n.replayMessages()
	n.liveReplay()

	return n
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

// randomTimeout returns a value that is between the minVal and 2x minVal.
func randomTimeout(minVal time.Duration) time.Duration {
	//return minVal
	if minVal == 0 {
		return minVal
	}
	extra := time.Duration(rand.Int63()) % minVal
	return minVal + extra
}
