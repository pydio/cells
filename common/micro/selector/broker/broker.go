package broker

import (
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"strconv"
)

type brokerSelector struct {
	so selector.Options
	hostname string
	port string
}

func NewSelector(hostname, port string, opts ...selector.Option) selector.Selector {
	r := &brokerSelector{}

	sopts := selector.Options{}
	for _, opt := range opts {
		opt(&sopts)
	}

	r.so = sopts
	r.hostname = hostname
	r.port = port

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
	hostname := r.hostname
	port, err := strconv.Atoi(hostname)
	if err != nil {
		return nil, err
	}
	return func() (*registry.Node, error) {
		return &registry.Node{
			Id:      "pydio.grpc.broker",
			Address: hostname,
			Port:    port,
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
