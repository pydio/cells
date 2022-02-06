package registry

import (
	"context"
	pb "github.com/pydio/cells/v4/common/proto/registry"
)

type Registry interface {
	Start(Item) error
	Stop(Item) error
	Register(Item) error
	Deregister(Item) error
	Get(string, ...Option) (Item, error)
	List(...Option) ([]Item, error)
	Watch(...Option) (Watcher, error)

	As(interface{}) bool
}

type Item interface {
	Name() string
	ID() string
	Metadata() map[string]string
	As(interface{}) bool
}

type Context interface {
	Context(context.Context)
}

type Watcher interface {
	Next() (Result, error)
	Stop()
}

type Result interface {
	Action() pb.ActionType
	Items() []Item
}

type registry struct {
	r Registry
}

func NewRegistry(r Registry) Registry {
	return &registry{r: r}
}

func (r *registry) Start(i Item) error {
	return r.r.Start(i)
}

func (r *registry) Stop(i Item) error {
	return r.r.Stop(i)
}

func (r *registry) Register(i Item) error {
	return r.r.Register(i)
}

func (r *registry) Deregister(i Item) error {
	return r.r.Deregister(i)
}

func (r *registry) Get(s string, opts ...Option) (Item, error) {
	return r.r.Get(s, opts...)
}

func (r *registry) List(opts ...Option) ([]Item, error) {
	return r.r.List(opts...)
}

func (r *registry) Watch(option ...Option) (Watcher, error) {
	return r.r.Watch(option...)
}

func (r *registry) As(i interface{}) bool {
	return r.r.As(i)
}
