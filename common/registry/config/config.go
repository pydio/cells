package configregistry

import (
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/pydio/cells/v4/common/etl/models"

	"github.com/pydio/cells/v4/common/etl"

	"github.com/pydio/cells/v4/common/config"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	scheme        = "memory"
	shared        registry.Registry
	sharedOnce    = &sync.Once{}
	sendEventTime = 10 * time.Millisecond
)

type configRegistry struct {
	store config.Store

	sync.RWMutex

	cache    []registry.Item
	watchers map[string]*watcher
}

type options struct {
	itemType int
}

func NewConfigRegistry(store config.Store) registry.Registry {
	c := &configRegistry{
		store:    store,
		cache:    []registry.Item{},
		watchers: make(map[string]*watcher),
	}

	go c.watch()
	return c
}

func (c *configRegistry) watch() error {

	w, err := c.store.Watch()
	if err != nil {
		return err
	}

	for {
		res, err := w.Next()
		if err != nil {
			return err
		}
		items := make([]registry.Item, 0)
		if err := res.Default([]registry.Item{}).Scan(&items); err != nil {
			return err
		}

		merger := &etl.Merger{Options: &models.MergeOptions{}}

		diff := &Diff{}
		merger.Diff(items, c.cache, diff)

		c.cache = items

		for _, item := range diff.create {
			for _, watcher := range c.watchers {
				watcher.res <- &result{
					action: "create",
					item:   item,
				}
			}
		}

		for _, item := range diff.update {
			for _, watcher := range c.watchers {
				watcher.res <- &result{
					action: "update",
					item:   item,
				}
			}
		}

		for _, item := range diff.delete {
			for _, watcher := range c.watchers {
				watcher.res <- &result{
					action: "delete",
					item:   item,
				}
			}
		}
	}

	return nil
}

func (c *configRegistry) Start(item registry.Item) error {
	return nil
}

func (c *configRegistry) Stop(item registry.Item) error {
	return nil
}

func (c *configRegistry) Register(item registry.Item) error {
	var byName bool
	if md := item.Metadata(); md != nil {
		if _, ok := md[registry.ServiceMetaOverride]; ok {
			byName = true
		}
	}

	items := make([]registry.Item, 0)
	if err := c.store.Get().Default([]registry.Item{}).Scan(&items); err != nil {
		// do nothing
		fmt.Println("And the error is ? ", err)
	}

	var found bool

	// Then register all services
	for k, v := range items {
		if v == nil {
			continue
		}
		if v.ID() == item.ID() || (byName && v.Name() == item.Name()) {
			items[k] = item
			found = true
		}
	}

	// not found - adding it
	if !found {
		items = append(items, item)
	}

	if err := c.store.Set(items); err != nil {
		return err
	}

	if err := c.store.Save("system", "register"); err != nil {
		return err
	}

	return nil
}

func (c *configRegistry) Deregister(item registry.Item) error {
	var items []registry.Item
	if err := c.store.Get().Default([]registry.Item{}).Scan(&items); err != nil {
		// do nothing
	}

	for k, v := range items {
		if item.ID() == v.ID() {
			items = append(items[:k], items[k+1:]...)
		}
	}

	if err := c.store.Set(items); err != nil {
		return err
	}

	if err := c.store.Save("system", "deregister"); err != nil {
		return err
	}

	return nil
}

func (c *configRegistry) Get(s string, opts ...registry.Option) (registry.Item, error) {
	o := registry.Options{}
	for _, opt := range opts {
		if err := opt(&o); err != nil {
			return nil, err
		}
	}

	var items []registry.Item
	if err := c.store.Get().Default([]registry.Item{}).Scan(&items); err != nil {
		// do nothing
	}

	for _, v := range items {
		if s == v.Name() {
			return v, nil
		}
	}
	return nil, os.ErrNotExist
}

func (c *configRegistry) List(opts ...registry.Option) ([]registry.Item, error) {

	o := registry.Options{}
	for _, opt := range opts {
		if err := opt(&o); err != nil {
			return nil, err
		}
	}

	var items []registry.Item
	if err := c.store.Get().Default([]registry.Item{}).Scan(&items); err != nil {
		// do nothing
	}

	if o.Type == pb.ItemType_ALL {
		return items, nil
	}

	var res []registry.Item

	for _, item := range items {
		switch o.Type {
		case pb.ItemType_SERVICE:
			if service, ok := item.(registry.Service); ok {
				if o.Filter != nil && !o.Filter(service) {
					continue
				}
				res = append(res, service)
			}
		case pb.ItemType_NODE:
			if node, ok := item.(registry.Node); ok {
				if o.Filter != nil && !o.Filter(node) {
					continue
				}
				res = append(res, node)
			}
		}
	}

	return res, nil
}

func (c *configRegistry) Watch(opts ...registry.Option) (registry.Watcher, error) {
	// parse the options, fallback to the default domain
	var wo registry.Options
	for _, o := range opts {
		o(&wo)
	}

	// construct the watcher
	w := &watcher{
		exit: make(chan bool),
		res:  make(chan registry.Result),
		id:   uuid.New(),
		wo:   wo,
	}

	c.Lock()
	c.watchers[w.id] = w
	c.Unlock()

	return w, nil
}

func (c *configRegistry) As(interface{}) bool {
	return false
}

func (c *configRegistry) sendEvent(r registry.Result) {
	c.RLock()
	watchers := make([]*watcher, 0, len(c.watchers))
	for _, w := range c.watchers {
		watchers = append(watchers, w)
	}
	c.RUnlock()

	for _, w := range watchers {
		select {
		case <-w.exit:
			c.Lock()
			delete(c.watchers, w.id)
			c.Unlock()
		default:
			select {
			case w.res <- r:
			case <-time.After(sendEventTime):
			}
		}
	}
}
