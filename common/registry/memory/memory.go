package memory

import (
	"context"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"net/url"
	"os"
	"sync"
)

var (
	scheme     = "mem"
	caches     = make(map[string]registry.Registry)
	cachesLock = &sync.Mutex{}
)

type URLOpener struct{}

func init() {
	o := &URLOpener{}
	registry.DefaultURLMux().Register(scheme, o)
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (registry.Registry, error) {
	byName := u.Query().Get("byname") == "true"
	cacheKey := u.Query().Get("cache")
	if u.Query().Get("cache") != "" {
		cachesLock.Lock()
		defer cachesLock.Unlock()
		if r, o := caches[cacheKey]; o {
			return r, nil
		} else {
			reg := registry.NewRegistry(newMemory(byName))
			caches[cacheKey] = reg
			return reg, nil
		}
	}
	return registry.NewRegistry(newMemory(byName)), nil
}

type memory struct {
	register []registry.Item

	sync.RWMutex
	broadcasters map[string]chan registry.Result

	// If registry has idAsName true, services with same names
	// will override one-another
	idAsName bool
}

type options struct {
	itemType int
}

func newMemory(idAsName bool) registry.Registry {
	return &memory{
		broadcasters: make(map[string]chan registry.Result),
		idAsName:     idAsName,
	}
}

func (m *memory) Start(item registry.Item) error {
	// go m.sendEvent(registry.NewResult(pb.A"start_request", item))
	return nil
}

func (m *memory) Stop(item registry.Item) error {
	// go m.sendEvent(&result{action: "stop_request", item: item})

	return nil
}

func (m *memory) Register(item registry.Item) error {
	// Then register all services
	for k, v := range m.register {
		if v.ID() == item.ID() || (m.idAsName && v.Name() == item.Name()) {
			m.register[k] = item
			go m.sendEvent(registry.NewResult(pb.ActionType_UPDATE, []registry.Item{item}))
			go m.sendEvent(registry.NewResult(pb.ActionType_FULL_LIST, m.register))
			return nil
		}
	}

	// not found - adding it
	m.register = append(m.register, item)
	go m.sendEvent(registry.NewResult(pb.ActionType_CREATE, []registry.Item{item}))
	go m.sendEvent(registry.NewResult(pb.ActionType_FULL_LIST, m.register))

	return nil
}

func (m *memory) Deregister(item registry.Item) error {
	for k, v := range m.register {
		if item.ID() == v.ID() {
			m.register = append(m.register[:k], m.register[k+1:]...)
			go m.sendEvent(registry.NewResult(pb.ActionType_DELETE, []registry.Item{item}))
		}
	}

	go m.sendEvent(registry.NewResult(pb.ActionType_FULL_LIST, m.register))
	return nil
}

func (m *memory) Get(s string, opts ...registry.Option) (registry.Item, error) {
	o := registry.Options{}
	for _, opt := range opts {
		if err := opt(&o); err != nil {
			return nil, err
		}
	}

	for _, v := range m.register {
		if s == v.Name() {
			return v, nil
		}
	}
	return nil, os.ErrNotExist
}

func (m *memory) List(opts ...registry.Option) ([]registry.Item, error) {
	var items []registry.Item

	o := registry.Options{}
	for _, opt := range opts {
		if err := opt(&o); err != nil {
			return nil, err
		}
	}

	if o.Type == pb.ItemType_ALL {
		return m.register, nil
	}

	for _, item := range m.register {
		switch o.Type {
		case pb.ItemType_SERVICE:
			if service, ok := item.(registry.Service); ok {
				if o.Filter != nil && !o.Filter(service) {
					continue
				}
				items = append(items, service)
			}
		case pb.ItemType_NODE:
			if node, ok := item.(registry.Node); ok {
				if o.Filter != nil && !o.Filter(node) {
					continue
				}
				items = append(items, node)
			}
		}
	}

	return items, nil
}

func (m *memory) Watch(opts ...registry.Option) (registry.Watcher, error) {
	// parse the options, fallback to the default domain
	var wo registry.Options
	for _, o := range opts {
		o(&wo)
	}

	id := uuid.New()
	res := make(chan registry.Result)

	// construct the watcher
	w := registry.NewWatcher(
		id,
		wo,
		res,
	)

	m.Lock()
	m.broadcasters[id] = res
	m.Unlock()

	return w, nil
}

func (m *memory) As(interface{}) bool {
	return false
}

func (m *memory) sendEvent(r registry.Result) {
	m.RLock()
	broadcasters := make([]chan registry.Result, 0, len(m.broadcasters))
	for _, w := range m.broadcasters {
		broadcasters = append(broadcasters, w)
	}
	m.RUnlock()

	for _, b := range broadcasters {
		select {
		case b <- r:
		default:
		}
	}
}
