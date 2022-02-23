package configregistry

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"sync"
	"time"

	"github.com/pydio/cells/v4/common/config/memory"

	"github.com/pydio/cells/v4/common/config/file"

	"github.com/pydio/cells/v4/common/log"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/config/etcd"
	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v4/common/etl/models"

	"github.com/pydio/cells/v4/common/etl"

	"github.com/pydio/cells/v4/common/config"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	schemes    = []string{"etcd", "file", "mem"}
	shared     registry.Registry
	sharedOnce = &sync.Once{}
)

type URLOpener struct{}

func init() {
	o := &URLOpener{}
	for _, scheme := range schemes {
		registry.DefaultURLMux().Register(scheme, o)
	}
}

func (o *URLOpener) openURL(ctx context.Context, u *url.URL) (registry.Registry, error) {
	var reg registry.Registry

	byName := u.Query().Get("byname") == "true"

	switch u.Scheme {
	case "etcd":
		tls := u.Query().Get("tls") == "true"
		addr := u.Host
		if tls {
			addr = "https://" + addr
		} else {
			addr = "http://" + addr
		}

		// Registry via etcd
		etcdConn, err := clientv3.New(clientv3.Config{
			Endpoints:   []string{addr},
			DialTimeout: 2 * time.Second,
		})

		if err != nil {
			return nil, err
		}

		store := etcd.NewSource(context.Background(), etcdConn, "registry", WithJSONItem())
		reg = NewConfigRegistry(store, byName)
	case "file":
		store, err := file.New(u.Path, true, WithJSONItem())
		if err != nil {
			return nil, err
		}
		reg = NewConfigRegistry(store, byName)
	case "mem":
		store := memory.New()

		reg = NewConfigRegistry(store, byName)
	}

	return reg, nil
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (registry.Registry, error) {
	if u.Query().Get("cache") == "shared" {
		sharedOnce.Do(func() {
			if s, err := o.openURL(ctx, u); err != nil {
				log.Fatal("Could not open shared registry", zap.Error(err))
			} else {
				shared = s
			}
		})

		return shared, nil
	}

	return o.openURL(ctx, u)
}

type configRegistry struct {
	store config.Store

	sync.RWMutex

	cache        []registry.Item
	broadcasters map[string]chan registry.Result
	namedCache   map[string]string
}

type options struct {
	itemType int
}

func NewConfigRegistry(store config.Store, byName bool) registry.Registry {
	c := &configRegistry{
		store:        store,
		cache:        []registry.Item{},
		broadcasters: make(map[string]chan registry.Result),
	}
	if byName {
		c.namedCache = make(map[string]string)
	}

	go c.watch()
	return c
}

func (c *configRegistry) watch() error {
	w, err := c.store.Watch()
	if err != nil {
		fmt.Println("There is an error watching the store ", err)
		return err
	}

	for {
		res, err := w.Next()
		if err != nil {
			fmt.Println("There is an error nexting the store  ", err)
			return err
		}

		itemsMap := map[string]registry.Item{}
		if err := res.Default(map[string]registry.Item{}).Scan(itemsMap); err != nil {
			return err
		}

		var items []registry.Item
		for _, i := range itemsMap {
			items = append(items, i)
		}

		c.RLock()
		for _, broadcaster := range c.broadcasters {
			select {
			case broadcaster <- registry.NewResult(pb.ActionType_FULL_LIST, items):
			default:
			}
		}
		c.RUnlock()

		merger := &etl.Merger{Options: &models.MergeOptions{}}

		diff := &Diff{}
		merger.Diff(items, c.cache, diff)

		c.cache = items

		if len(diff.create) > 0 {
			c.RLock()
			for _, broadcaster := range c.broadcasters {
				select {
				case broadcaster <- registry.NewResult(pb.ActionType_CREATE, diff.create):
				default:
				}
			}
			c.RUnlock()
		}

		if len(diff.update) > 0 {
			c.RLock()
			for _, broadcaster := range c.broadcasters {
				select {
				case broadcaster <- registry.NewResult(pb.ActionType_UPDATE, diff.update):
				default:
				}
			}
			c.RUnlock()
		}

		if len(diff.delete) > 0 {
			c.RLock()
			for _, broadcaster := range c.broadcasters {
				select {
				case broadcaster <- registry.NewResult(pb.ActionType_DELETE, diff.delete):
				default:
				}
			}
			c.RUnlock()
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
	c.store.Lock()
	defer c.store.Unlock()

	// If byName is active and we are re-registering a service
	// with the same name, deregister the previous one.
	// The namedCache uses the store lock.
	if c.namedCache != nil {
		if foundID, ok := c.namedCache[item.Name()]; ok {
			if er := c.store.Val(foundID).Del(); er != nil {
				return er
			}
		}
		c.namedCache[item.Name()] = item.ID()
	}

	if err := c.store.Val(item.ID()).Set(item); err != nil {
		return err
	}

	if err := c.store.Save("system", "register"); err != nil {
		return err
	}

	return nil
}

func (c *configRegistry) Deregister(item registry.Item) error {
	c.store.Lock()
	defer c.store.Unlock()

	if err := c.store.Val(item.ID()).Del(); err != nil {
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

	items := map[string]registry.Item{}
	if err := c.store.Get().Default(map[string]registry.Item{}).Scan(items); err != nil {
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

	items := map[string]registry.Item{}
	if err := c.store.Get().Default(map[string]registry.Item{}).Scan(items); err != nil {
		// do nothing
	}

	var res []registry.Item

	for _, item := range items {
		switch o.Type {
		case pb.ItemType_ALL:
			res = append(res, item)
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

	id := uuid.New()
	res := make(chan registry.Result)

	// construct the watcher
	w := registry.NewWatcher(
		uuid.New(),
		wo,
		res,
	)

	c.Lock()
	c.broadcasters[id] = res
	c.Unlock()

	return w, nil
}

func (c *configRegistry) As(interface{}) bool {
	return false
}
