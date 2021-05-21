package broker

import (
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
)

type brokerSelector struct {
	so selector.Options
}

func NewSelector(opts ...selector.Option) selector.Selector {
	r := &brokerSelector{}

	sopts := selector.Options{}
	for _, opt := range opts {
		opt(&sopts)
	}

	r.so = sopts

	return r
}

func (r *brokerSelector) Init(opts ...selector.Option) error {
	for _, o := range opts {
		o(&r.so)
	}
	return nil
}
func (r *brokerSelector) Options() selector.Options {
	return r.so

}

// Select returns a function which should return the next node
func (r *brokerSelector) Select(service string, opts ...selector.SelectOption) (selector.Next, error) {
	return func() (*registry.Node, error) {
		return &registry.Node{
			Id:      "pydio.grpc.broker",
			Address: "127.0.0.1",
			Port:    8003,
		}, nil
	}, nil
}

// Mark sets the success/error against a node
func (r *brokerSelector) Mark(service string, node *registry.Node, err error) {
}

// Reset returns state back to zero for a service
func (r *brokerSelector) Reset(service string) {
}

// Close renders the selector unusable
func (r *brokerSelector) Close() error {
	return nil
}

// Name of the selector
func (r *brokerSelector) String() string {
	return "broker"
}
