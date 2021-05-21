package service

import (
	"context"
	"time"

	defaults "github.com/pydio/cells/common/micro"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
	pb "github.com/pydio/cells/common/proto/broker"
)

var (
	name    = "broker"
	address = ":8003"
)

type serviceBroker struct {
	Addrs   []string
	Client  pb.BrokerClient
	options broker.Options
}

func (b *serviceBroker) Address() string {
	return b.Addrs[0]
}

func (b *serviceBroker) Connect() error {
	return nil
}

func (b *serviceBroker) Disconnect() error {
	return nil
}

func (b *serviceBroker) Init(opts ...broker.Option) error {
	for _, o := range opts {
		o(&b.options)
	}
	b.Client = pb.NewBrokerClient(name, client.DefaultClient)
	return nil
}

func (b *serviceBroker) Options() broker.Options {
	return b.options
}

func (b *serviceBroker) Publish(topic string, msg *broker.Message, opts ...broker.PublishOption) error {
	_, err := b.Client.Publish(context.TODO(), &pb.PublishRequest{
		Topic: topic,
		Message: &pb.Message{
			Header: msg.Header,
			Body:   msg.Body,
		},
	})
	return err
}

func (b *serviceBroker) Subscribe(topic string, handler broker.Handler, opts ...broker.SubscribeOption) (broker.Subscriber, error) {
	var options broker.SubscribeOptions
	for _, o := range opts {
		o(&options)
	}

	stream, err := b.Client.Subscribe(context.TODO(), &pb.SubscribeRequest{
		Topic: topic,
		Queue: options.Queue,
	})
	if err != nil {
		return nil, err
	}

	sub := &serviceSub{
		topic:   topic,
		queue:   options.Queue,
		handler: handler,
		stream:  stream,
		closed:  make(chan bool),
		options: options,
	}

	go func() {
		for {
			select {
			case <-sub.closed:
				return
			default:
				if err := sub.run(); err != nil {
					stream, err := b.Client.Subscribe(context.TODO(), &pb.SubscribeRequest{
						Topic: topic,
						Queue: options.Queue,
					})
					if err != nil {

						time.Sleep(time.Second)
						continue
					}
					// new stream
					sub.stream = stream
				}
			}
		}
	}()

	return sub, nil
}

func (b *serviceBroker) String() string {
	return "service"
}

func NewBroker(opts ...broker.Option) broker.Broker {
	var options broker.Options
	for _, o := range opts {
		o(&options)
	}

	addrs := options.Addrs
	if len(addrs) == 0 {
		addrs = []string{address}
	}

	// extract the client from the context, fallback to grpc
	var cli client.Client
	if c, ok := options.Context.Value(clientKey{}).(client.Client); ok {
		cli = c
	} else {
		cli = defaults.NewClient()
	}

	return &serviceBroker{
		Addrs:   addrs,
		Client:  pb.NewBrokerClient(name, cli),
		options: options,
	}
}
