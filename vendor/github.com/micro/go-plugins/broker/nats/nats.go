// Package nats provides a NATS broker
package nats

import (
	"context"
	"strings"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/broker/codec/json"
	"github.com/micro/go-micro/cmd"
	"github.com/nats-io/nats"
)

type nbroker struct {
	addrs []string
	conn  *nats.Conn
	opts  broker.Options
	nopts nats.Options
}

type subscriber struct {
	s    *nats.Subscription
	opts broker.SubscribeOptions
}

type publication struct {
	t string
	m *broker.Message
}

func init() {
	cmd.DefaultBrokers["nats"] = NewBroker
}

func (n *publication) Topic() string {
	return n.t
}

func (n *publication) Message() *broker.Message {
	return n.m
}

func (n *publication) Ack() error {
	return nil
}

func (n *subscriber) Options() broker.SubscribeOptions {
	return n.opts
}

func (n *subscriber) Topic() string {
	return n.s.Subject
}

func (n *subscriber) Unsubscribe() error {
	return n.s.Unsubscribe()
}

func (n *nbroker) Address() string {
	if n.conn != nil && n.conn.IsConnected() {
		return n.conn.ConnectedUrl()
	}
	if len(n.addrs) > 0 {
		return n.addrs[0]
	}

	return ""
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

func (n *nbroker) Connect() error {
	if n.conn != nil {
		return nil
	}

	opts := n.nopts
	opts.Servers = n.addrs
	opts.Secure = n.opts.Secure
	opts.TLSConfig = n.opts.TLSConfig

	// secure might not be set
	if n.opts.TLSConfig != nil {
		opts.Secure = true
	}

	c, err := opts.Connect()
	if err != nil {
		return err
	}
	n.conn = c
	return nil
}

func (n *nbroker) Disconnect() error {
	n.conn.Close()
	return nil
}

func (n *nbroker) Init(opts ...broker.Option) error {
	for _, o := range opts {
		o(&n.opts)
	}
	n.addrs = setAddrs(n.opts.Addrs)
	return nil
}

func (n *nbroker) Options() broker.Options {
	return n.opts
}

func (n *nbroker) Publish(topic string, msg *broker.Message, opts ...broker.PublishOption) error {
	b, err := n.opts.Codec.Marshal(msg)
	if err != nil {
		return err
	}
	return n.conn.Publish(topic, b)
}

func (n *nbroker) Subscribe(topic string, handler broker.Handler, opts ...broker.SubscribeOption) (broker.Subscriber, error) {
	opt := broker.SubscribeOptions{
		AutoAck: true,
	}

	for _, o := range opts {
		o(&opt)
	}

	fn := func(msg *nats.Msg) {
		var m broker.Message
		if err := n.opts.Codec.Unmarshal(msg.Data, &m); err != nil {
			return
		}
		handler(&publication{m: &m, t: msg.Subject})
	}

	var sub *nats.Subscription
	var err error

	if len(opt.Queue) > 0 {
		sub, err = n.conn.QueueSubscribe(topic, opt.Queue, fn)
	} else {
		sub, err = n.conn.Subscribe(topic, fn)
	}
	if err != nil {
		return nil, err
	}
	return &subscriber{s: sub, opts: opt}, nil
}

func (n *nbroker) String() string {
	return "nats"
}

func NewBroker(opts ...broker.Option) broker.Broker {
	options := broker.Options{
		// Default codec
		Codec:   json.NewCodec(),
		Context: context.Background(),
	}

	for _, o := range opts {
		o(&options)
	}

	natsOpts := nats.GetDefaultOptions()
	if n, ok := options.Context.Value(optionsKey{}).(nats.Options); ok {
		natsOpts = n
	}

	// broker.Options have higher priority than nats.Options
	// only if Addrs, Secure or TLSConfig were not set through a broker.Option
	// we read them from nats.Option
	if len(options.Addrs) == 0 {
		options.Addrs = natsOpts.Servers
	}

	if !options.Secure {
		options.Secure = natsOpts.Secure
	}

	if options.TLSConfig == nil {
		options.TLSConfig = natsOpts.TLSConfig
	}

	nb := &nbroker{
		opts:  options,
		nopts: natsOpts,
		addrs: setAddrs(options.Addrs),
	}

	return nb
}
