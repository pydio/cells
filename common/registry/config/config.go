/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package configregistry

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"sync"
	"time"

	"github.com/pydio/cells/v4/common/utils/configx"

	"github.com/pydio/cells/v4/common/config/memory"

	"github.com/pydio/cells/v4/common/config/file"

	"github.com/pydio/cells/v4/common/log"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/config/etcd"
	clientv3 "go.etcd.io/etcd/client/v3"

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
	var reg registry.RawRegistry

	byName := u.Query().Get("byname") == "true"

	var opts []configx.Option
	encode := u.Query().Get("encoding")
	switch encode {
	case "string":
		opts = append(opts, configx.WithString())
	case "yaml":
		opts = append(opts, configx.WithYAML())
	case "json":
		opts = append(opts, configx.WithJSON())
	case "jsonitem":
		opts = append(opts, WithJSONItem())
	}

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

		store := etcd.NewSource(ctx, etcdConn, "registry", true, true, opts...)
		reg = NewConfigRegistry(store, byName)
	case "file":
		store, err := file.New(u.Path, true, opts...)
		if err != nil {
			return nil, err
		}
		reg = NewConfigRegistry(store, byName)
	case "mem":
		store := memory.New(opts...)

		reg = NewConfigRegistry(store, byName)
	}

	return registry.GraphRegistry(reg), nil
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
	broadcasters map[string]broadcaster
	namedCache   map[string]string
}

type broadcaster struct {
	Types []pb.ItemType
	Ch    chan registry.Result
}

type options struct {
	itemType int
}

func NewConfigRegistry(store config.Store, byName bool) registry.RawRegistry {
	c := &configRegistry{
		store:        store,
		cache:        []registry.Item{},
		broadcasters: make(map[string]broadcaster),
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

		for _, broadcaster := range c.broadcasters {
			for _, itemType := range broadcaster.Types {
				v := res.Val(getFromItemType(itemType))
				if v.Get() == nil {
					continue
				}

				items, err := c.List(registry.WithType(itemType))
				if err != nil {
					continue
				}

				select {
				case broadcaster.Ch <- registry.NewResult(pb.ActionType_FULL_LIST, items):
				default:
				}

				// TODO something for updates and creates and deletes
				/*itemsMap := map[string]registry.Item{}
				if err := v.Default(map[string]registry.Item{}).Scan(itemsMap); err != nil {
					fmt.Println("there is an error here ?", err)
					return err
				}


				var items []registry.Item
				for _, i := range itemsMap {
					items = append(items, i)
				}*/
			}
		}
		/*itemsMap := map[string]registry.Item{}
		if err := res.Val().Default(map[string]registry.Item{}).Scan(itemsMap); err != nil {
			fmt.Println("there is an error here ?", err)
			return err
		}

		var items []registry.Item
		for _, i := range itemsMap {
			items = append(items, i)
		}

		fmt.Println("We are here ? ", len(items))

		c.RLock()
		for _, broadcaster := range c.broadcasters {
			select {
			case broadcaster.Ch <- registry.NewResult(pb.ActionType_FULL_LIST, items):
			default:
			}
		}
		c.RUnlock()*/

		/*merger := &etl.Merger{Options: &models.MergeOptions{}}

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
					fmt.Println("Could not send the delete ?")
				}
			}
			c.RUnlock()
		}
		*/
	}

	return nil
}

func (c *configRegistry) Start(item registry.Item) error {
	return nil
}

func (c *configRegistry) Stop(item registry.Item) error {
	return nil
}

func getType(item registry.Item) string {
	switch v := item.(type) {
	case registry.Service:
		return "service"
	case registry.Node:
		return "node"
	case registry.Edge:
		return "edge"
	case registry.Dao:
		return "dao"
	case registry.Server:
		return "server"
	case registry.Generic:
		switch v.Type() {
		case pb.ItemType_ADDRESS:
			return "address"
		case pb.ItemType_ENDPOINT:
			return "endpoint"
		case pb.ItemType_TAG:
			return "tag"
		case pb.ItemType_STATS:
			return "stats"
		default:
			return "generic"
		}
	default:
		return "other"
	}
}

func getFromItemType(itemType pb.ItemType) string {
	switch itemType {
	case pb.ItemType_SERVICE:
		return "service"
	case pb.ItemType_NODE:
		return "node"
	case pb.ItemType_EDGE:
		return "edge"
	case pb.ItemType_DAO:
		return "dao"
	case pb.ItemType_SERVER:
		return "server"
	case pb.ItemType_GENERIC:
		return "generic"
	case pb.ItemType_ADDRESS:
		return "address"
	case pb.ItemType_STATS:
		return "stats"
	case pb.ItemType_TAG:
		return "tag"
	case pb.ItemType_ENDPOINT:
		return "endpoint"
	default:
		return "other"
	}
}

func (c *configRegistry) Register(item registry.Item, option ...registry.RegisterOption) error {
	c.store.Lock()
	defer c.store.Unlock()

	// If byName is active and we are re-registering a service
	// with the same name, deregister the previous one.
	// The namedCache uses the store lock.
	if c.namedCache != nil {
		if foundID, ok := c.namedCache[item.Name()]; ok {
			if er := c.store.Val(getType(item)).Val(foundID).Del(); er != nil {
				return er
			}
		}
		c.namedCache[item.Name()] = item.ID()
	}

	if err := c.store.Val(getType(item)).Val(item.ID()).Set(item); err != nil {
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

	if err := c.store.Val(getType(item)).Val(item.ID()).Del(); err != nil {
		return err
	}

	if err := c.store.Save("system", "deregister"); err != nil {
		return err
	}

	return nil
}

func (c *configRegistry) Get(id string, opts ...registry.Option) (registry.Item, error) {
	o := registry.Options{}
	for _, opt := range opts {
		if err := opt(&o); err != nil {
			return nil, err
		}
	}

	items, err := c.List(opts...)
	if err != nil {
		return nil, err
	}

	for _, v := range items {
		if id == v.ID() {
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

	if len(o.Types) == 0 {
		return nil, fmt.Errorf("shoudn't call without a type")
	}

	var res []registry.Item

	for _, itemType := range o.Types {
		var store configx.Values
		switch itemType {
		case pb.ItemType_NODE:
			store = c.store.Val("node")
		case pb.ItemType_SERVICE:
			store = c.store.Val("service")
		case pb.ItemType_SERVER:
			store = c.store.Val("server")
		case pb.ItemType_DAO:
			store = c.store.Val("dao")
		case pb.ItemType_EDGE:
			store = c.store.Val("edge")
		case pb.ItemType_GENERIC:
			store = c.store.Val("generic")
		case pb.ItemType_ADDRESS:
			store = c.store.Val("address")
		case pb.ItemType_ENDPOINT:
			store = c.store.Val("endpoint")
		case pb.ItemType_STATS:
			store = c.store.Val("stats")
		case pb.ItemType_TAG:
			store = c.store.Val("tag")
		default:
			store = c.store.Val("other")
		}

		items := map[string]registry.Item{}
		if store.Get() == nil {
			return res, nil
		}

		if err := store.Get().Default(map[string]registry.Item{}).Scan(items); err != nil {
			fmt.Println("No items retrieved in list")
			// do nothing
		}

		for _, item := range items {
			found := false
			for _, name := range o.Names {
				if o.Matches(name, item.Name()) {
					found = true
					break
				}
			}

			if len(o.Names) > 0 && !found {
				continue
			}

			accept := true
			for _, filter := range o.Filters {
				if !filter(item) {
					accept = false
					break
				}
			}

			if len(o.Filters) > 0 && !accept {
				continue
			}

			res = append(res, item)
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
	res := make(chan registry.Result, 100)

	// construct the watcher
	w := registry.NewWatcher(
		uuid.New(),
		wo,
		res,
	)

	c.Lock()
	c.broadcasters[id] = broadcaster{
		Types: wo.Types,
		Ch:    res,
	}
	c.Unlock()

	// Wrap in a configWatcher to properly deregister on stop
	cw := &configWatcher{
		Watcher: w,
		onStop: func() {
			c.Lock()
			delete(c.broadcasters, id)
			c.Unlock()
		},
	}

	return cw, nil
}

func (c *configRegistry) As(interface{}) bool {
	return false
}

type configWatcher struct {
	registry.Watcher
	onStop func()
}

func (c *configWatcher) Stop() {
	c.Watcher.Stop()
	c.onStop()
}
