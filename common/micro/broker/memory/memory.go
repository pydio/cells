package memory

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"net"
	"sync"
	"time"

	"github.com/cskr/pubsub"
	"github.com/micro/go-micro/broker"
	"github.com/micro/misc/lib/addr"
)

var (
	PubSubBufferCapacity = 10000
)

type memoryBroker struct {
	sync.RWMutex

	opts      broker.Options
	addr      string
	connected bool
	bus       *pubsub.PubSub
}

type memorySubscriber struct {
	topic string
	exit  chan bool
	opts  broker.SubscribeOptions
}

func (m *memoryBroker) Options() broker.Options {
	return m.opts
}

func (m *memoryBroker) Address() string {
	return m.addr
}

func (m *memoryBroker) Connect() error {
	m.Lock()
	defer m.Unlock()

	if m.connected {
		return nil
	}
	m.bus = pubsub.New(PubSubBufferCapacity)

	// use 127.0.0.1 to avoid scan of all network interfaces
	add, err := addr.Extract("127.0.0.1")
	if err != nil {
		return err
	}
	i := rand.Intn(20000)
	// set add with port
	add = net.JoinHostPort(add, fmt.Sprintf("%d", 10000+i))
	m.addr = add
	m.connected = true

	return nil
}

func (m *memoryBroker) Disconnect() error {
	m.Lock()
	defer m.Unlock()

	if !m.connected {
		return nil
	}

	m.connected = false
	m.bus.Shutdown()

	return nil
}

func (m *memoryBroker) Init(opts ...broker.Option) error {
	for _, o := range opts {
		o(&m.opts)
	}
	return nil
}

func (m *memoryBroker) Publish(topic string, msg *broker.Message, opts ...broker.PublishOption) error {
	m.RLock()
	if !m.connected {
		m.RUnlock()
		return errors.New("not connected")
	}
	m.RUnlock()

	m.bus.Pub(msg, topic)
	return nil
}

func (m *memoryBroker) Subscribe(topic string, handler broker.Handler, opts ...broker.SubscribeOption) (broker.Subscriber, error) {
	m.RLock()
	if !m.connected {
		m.RUnlock()
		return nil, errors.New("not connected")
	}
	m.RUnlock()

	var options broker.SubscribeOptions
	for _, o := range opts {
		o(&options)
	}

	listener := m.bus.Sub(topic)
	sub := &memorySubscriber{
		exit:  make(chan bool, 1),
		topic: topic,
		opts:  options,
	}

	go func() {
		defer m.bus.Unsub(listener, topic)
		for {
			select {
			case msg := <-listener:
				handler(&memoryEvent{topic: topic, message: msg.(*broker.Message)})
			case <-sub.exit:
				return
			}
		}
	}()

	return sub, nil
}

func (m *memoryBroker) String() string {
	return "memory"
}

func (m *memorySubscriber) Options() broker.SubscribeOptions {
	return m.opts
}

func (m *memorySubscriber) Topic() string {
	return m.topic
}

func (m *memorySubscriber) Unsubscribe() error {
	m.exit <- true
	return nil
}

type memoryEvent struct {
	topic   string
	err     error
	message *broker.Message
}

func (s *memoryEvent) Topic() string {
	return s.topic
}

func (s *memoryEvent) Message() *broker.Message {
	return s.message
}

func (s *memoryEvent) Ack() error {
	return nil
}

func NewBroker(opts ...broker.Option) broker.Broker {
	options := broker.Options{
		Context: context.Background(),
	}

	rand.Seed(time.Now().UnixNano())
	for _, o := range opts {
		o(&options)
	}

	return &memoryBroker{
		opts: options,
	}
}
