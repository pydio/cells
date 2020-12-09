// Package http implements a go-micro.Server
package http

import (
	"errors"
	"net"
	"net/http"
	"sync"

	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/server"
)

type httpServer struct {
	sync.Mutex
	opts server.Options
	hd   server.Handler
	exit chan chan error
}

func init() {
	cmd.DefaultServers["http"] = NewServer
}

func (h *httpServer) Options() server.Options {
	h.Lock()
	opts := h.opts
	h.Unlock()
	return opts
}

func (h *httpServer) Init(opts ...server.Option) error {
	h.Lock()
	for _, o := range opts {
		o(&h.opts)
	}
	h.Unlock()
	return nil
}

func (h *httpServer) Handle(handler server.Handler) error {
	if _, ok := handler.Handler().(http.Handler); !ok {
		return errors.New("Handle requires http.Handler")
	}
	h.Lock()
	h.hd = handler
	h.Unlock()

	return nil
}

func (h *httpServer) NewHandler(handler interface{}, opts ...server.HandlerOption) server.Handler {
	options := server.HandlerOptions{
		Metadata: make(map[string]map[string]string),
	}

	for _, o := range opts {
		o(&options)
	}

	var eps []*registry.Endpoint

	if !options.Internal {
		for name, metadata := range options.Metadata {
			eps = append(eps, &registry.Endpoint{
				Name:     name,
				Metadata: metadata,
			})
		}
	}

	return &httpHandler{
		eps:  eps,
		hd:   handler,
		opts: options,
	}
}

func (h *httpServer) NewSubscriber(topic string, handler interface{}, opts ...server.SubscriberOption) server.Subscriber {
	var options server.SubscriberOptions
	for _, o := range opts {
		o(&options)
	}

	return &httpSubscriber{
		opts:  options,
		topic: topic,
		hd:    handler,
	}
}

func (h *httpServer) Subscribe(s server.Subscriber) error {
	return errors.New("subscribe is not supported")
}

func (h *httpServer) Register() error {
	h.Lock()
	opts := h.opts
	eps := h.hd.Endpoints()
	h.Unlock()

	service := serviceDef(opts)
	service.Endpoints = eps

	rOpts := []registry.RegisterOption{
		registry.RegisterTTL(opts.RegisterTTL),
	}

	return opts.Registry.Register(service, rOpts...)
}

func (h *httpServer) Deregister() error {
	h.Lock()
	opts := h.opts
	h.Unlock()

	service := serviceDef(opts)
	return opts.Registry.Deregister(service)
}

func (h *httpServer) Start() error {
	h.Lock()
	opts := h.opts
	hd := h.hd
	h.Unlock()

	ln, err := net.Listen("tcp", opts.Address)
	if err != nil {
		return err
	}

	h.Lock()
	h.opts.Address = ln.Addr().String()
	h.Unlock()

	handler, ok := hd.Handler().(http.Handler)
	if !ok {
		return errors.New("Server required http.Handler")
	}

	go http.Serve(ln, handler)

	go func() {
		ch := <-h.exit
		ch <- ln.Close()
	}()

	return nil
}

func (h *httpServer) Stop() error {
	ch := make(chan error)
	h.exit <- ch
	return <-ch
}

func (h *httpServer) String() string {
	return "http"
}

func newServer(opts ...server.Option) server.Server {
	return &httpServer{
		opts: newOptions(opts...),
		exit: make(chan chan error),
	}
}

func NewServer(opts ...server.Option) server.Server {
	return newServer(opts...)
}
