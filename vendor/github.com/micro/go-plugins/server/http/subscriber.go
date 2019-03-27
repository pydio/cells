package http

import (
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/server"
)

type httpSubscriber struct {
	opts  server.SubscriberOptions
	topic string
	hd    interface{}
}

func (h *httpSubscriber) Topic() string {
	return h.topic
}

func (h *httpSubscriber) Subscriber() interface{} {
	return h.hd
}

func (h *httpSubscriber) Endpoints() []*registry.Endpoint {
	return []*registry.Endpoint{}
}

func (h *httpSubscriber) Options() server.SubscriberOptions {
	return h.opts
}
