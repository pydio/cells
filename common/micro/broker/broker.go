package broker

import "github.com/micro/go-micro/broker"

type brokerwrap struct {
	b    broker.Broker
	opts Options
}

// NewBroker 包装一个标准的 broker，并当一个服务在运行的时候组织其关闭连接。
func NewBroker(b broker.Broker, opts ...Option) broker.Broker {
	return &brokerwrap{b, newOptions(opts...)}
}

// Options wraps standard function
func (b *brokerwrap) Options() broker.Options {
	return b.b.Options()
}

// Address wraps standard function
func (b *brokerwrap) Address() string {
	return b.b.Address()
}

// Connect wraps standard function
func (b *brokerwrap) Connect() error {
	return b.b.Connect()
}

// Disconnect handles the disconnection to the broker. It prevents it if there is a service that is still active
func (b *brokerwrap) Disconnect() error {
	for _, o := range b.opts.beforeDisconnect {
		if err := o(); err != nil {
			return err
		}
	}

	return b.b.Disconnect()
}

// Init wraps standard function
func (b *brokerwrap) Init(opts ...broker.Option) error {
	return b.b.Init(opts...)
}

// Publish wraps standard function
func (b *brokerwrap) Publish(s string, m *broker.Message, opts ...broker.PublishOption) error {
	return b.b.Publish(s, m, opts...)
}

// Publish wraps standard function
func (b *brokerwrap) Subscribe(s string, h broker.Handler, opts ...broker.SubscribeOption) (broker.Subscriber, error) {
	return b.b.Subscribe(s, h, opts...)
}

// Publish wraps standard function
func (b *brokerwrap) String() string {
	return b.b.String()
}
