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
	"crypto/tls"
	"fmt"
	"net/url"
	"os"
	"strings"
	"sync"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/memory"
	"github.com/pydio/cells/v4/common/crypto"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	schemes    = []string{"etcd", "file", "mem"}
	tlsSchemes = []string{"etcd+tls"}
	shared     registry.Registry
	sharedOnce = &sync.Once{}
)

type URLOpener struct {
	tlsConfig *tls.Config
}

type TLSURLOpener struct{}

func init() {
	o := &URLOpener{}
	for _, scheme := range schemes {
		registry.DefaultURLMux().Register(scheme, o)
	}
	tlso := &TLSURLOpener{}
	for _, scheme := range tlsSchemes {
		registry.DefaultURLMux().Register(scheme, tlso)
	}
}

func (o *TLSURLOpener) OpenURL(ctx context.Context, u *url.URL) (registry.Registry, error) {
	if tlsConfig, er := crypto.TLSConfigFromURL(u); er == nil {
		return (&URLOpener{tlsConfig}).OpenURL(ctx, u)
	} else {
		return nil, fmt.Errorf("error while loading tls config for etcd %v", er)
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
	default:
		if strings.HasPrefix(u.Scheme, "etcd") {
			opts = append(opts, WithJSONItem())
		}
	}

	// Init store
	opts = append(opts, configx.WithInitData(map[string]interface{}{
		//"node":     &sync.Map{},
		//"service":  &sync.Map{},
		//"edge":     &sync.Map{},
		//"dao":      &sync.Map{},
		//"server":   &sync.Map{},
		//"address":  &sync.Map{},
		//"endpoint": &sync.Map{},
		//"tag":      &sync.Map{},
		//"stats":    &sync.Map{},
		//"generic":  &sync.Map{},
		//"other":    &sync.Map{},
	}))

	switch strings.TrimSuffix(u.Scheme, "+tls") {
	//case "etcd":
	//	addr := "://" + u.Host
	//	if o.tlsConfig == nil {
	//		addr = "http" + addr
	//	} else {
	//		addr = "https" + addr
	//	}
	//
	//	// Registry via etcd
	//	pwd, _ := u.User.Password()
	//
	//	// Registry via etcd
	//	etcdConn, err := clientv3.New(clientv3.Config{
	//		Endpoints:   []string{addr},
	//		DialTimeout: 2 * time.Second,
	//		Username:    u.User.Username(),
	//		Password:    pwd,
	//		TLS:         o.tlsConfig,
	//	})
	//
	//	if err != nil {
	//		return nil, err
	//	}
	//
	//	store, err := etcd.NewSource(ctx, etcdConn, u.Path, 10, true, opts...)
	//	if err != nil {
	//		return nil, err
	//	}
	//	reg = NewConfigRegistry(store, byName)
	//case "file":
	//	store, err := file.New(u.Path, opts...)
	//	if err != nil {
	//		return nil, err
	//	}
	//	reg = NewConfigRegistry(store, byName)
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

	cache            []registry.Item
	broadcastersLock *sync.RWMutex
	broadcasters     map[string]broadcaster

	namedCacheLock *sync.RWMutex
	namedCache     map[string]string

	watchOnce *sync.Once
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
		store:            store,
		cache:            []registry.Item{},
		broadcastersLock: &sync.RWMutex{},
		broadcasters:     make(map[string]broadcaster),
		watchOnce:        &sync.Once{},
	}
	if byName {
		c.namedCacheLock = &sync.RWMutex{}
		c.namedCache = make(map[string]string)
	}
	return c
}

func (c *configRegistry) watch() error {
	w, err := c.store.Watch(configx.WithPath("*", "*"), configx.WithChangesOnly())
	if err != nil {
		return err
	}

	for {
		res, err := w.Next()
		if err != nil {
			return err
		}

		cv := res.(configx.Values)

		c.broadcastersLock.RLock()
		bcs := c.broadcasters
		c.broadcastersLock.RUnlock()

		for _, bc := range bcs {
			for _, itemType := range bc.Types {
				// Always start with DELETE if they are batched -+
				if err := c.scanAndBroadcast(cv, bc, itemType, "delete", pb.ActionType_DELETE); err != nil {
					return err
				}
				if err := c.scanAndBroadcast(cv, bc, itemType, "create", pb.ActionType_CREATE); err != nil {
					return err
				}
				if err := c.scanAndBroadcast(cv, bc, itemType, "update", pb.ActionType_UPDATE); err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func (c *configRegistry) scanAndBroadcast(res configx.Values, bc broadcaster, bcType pb.ItemType, keyName string, actionType pb.ActionType) error {
	values := res.Val(keyName)
	val := values.Val(getFromItemType(bcType))
	if val.Get() != nil {
		itemsMap := map[string]interface{}{}
		if err := val.Scan(&itemsMap); err != nil {
			log.Error("Error while scanning registry watch event to sync map", zap.Error(err))
			return err
		}
		var items []registry.Item
		for k, v := range itemsMap {
			if item, ok := v.(registry.Item); ok {
				items = append(items, item)
			} else {
				// For updates mainly, we may receive only parts of the item, so retrieving the full item in the registry
				if item, err := c.Get(k, registry.WithType(bcType)); err == nil {
					items = append(items, item)
				}
			}
		}

		go func() {
			bc.Ch <- registry.NewResult(actionType, items)
		}()
	}
	return nil
}

func (c *configRegistry) Close() error {
	return c.store.Close(context.TODO())
}

func (c *configRegistry) Done() <-chan struct{} {
	return c.store.Done()
}

func (c *configRegistry) Start(item registry.Item) error {
	return nil
}

func (c *configRegistry) Stop(item registry.Item) error {
	return nil
}

func getType(item registry.Item) string {
	var d registry.Dao
	if item == nil {
		return "generic"
	}
	if item.As(&d) {
		return "dao"
	}
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
		return "generic"
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
		return "generic"
	}
}

func (c *configRegistry) Register(item registry.Item, option ...registry.RegisterOption) error {
	c.store.Lock()
	defer c.store.Unlock()

	// If byName is active and we are re-registering a service
	// with the same name, deregister the previous one.
	// The namedCache uses the store lock.
	if c.namedCache != nil {
		c.namedCacheLock.RLock()
		if foundID, ok := c.namedCache[item.Name()]; ok {
			if er := c.store.Val(getType(item)).Val(foundID).Del(); er != nil {
				return er
			}
		}
		c.namedCacheLock.RUnlock()

		c.namedCacheLock.Lock()
		c.namedCache[item.Name()] = item.ID()
		c.namedCacheLock.Unlock()
	}

	if err := c.store.Val(getType(item)).Val(item.ID()).Set(item); err != nil {
		return err
	}

	// fmt.Println(c.store.Val(getType(item)).Val(item.ID()).Get())
	if err := c.store.Save("system", "register"); err != nil {
		return err
	}

	return nil
}

func (c *configRegistry) Deregister(item registry.Item, option ...registry.RegisterOption) error {
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
		opt(&o)
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
		opt(&o)
	}

	if len(o.Types) == 0 {
		o.Types = []pb.ItemType{
			pb.ItemType_NODE,
			pb.ItemType_SERVICE,
			pb.ItemType_SERVER,
			pb.ItemType_DAO,
			pb.ItemType_EDGE,
			pb.ItemType_GENERIC,
			pb.ItemType_ADDRESS,
			pb.ItemType_ENDPOINT,
			pb.ItemType_TAG,
		}
	}

	var res []registry.Item

	if c.store.Get() == nil {
		return res, nil
	}

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
			store = c.store.Val("generic")
		}

		if store.Get() == nil {
			continue
		}

		rawItems, ok := store.Default(map[string]any{}).Interface().(map[string]any)
		if !ok {
			fmt.Println("We have a problem here ", store.Interface())
			continue
		}

		for _, rawItem := range rawItems {
			var item registry.Item
			switch ri := rawItem.(type) {
			case registry.Item:
				item = ri
			case *pb.Item:
				item = util.ToItem(ri)
			}

			foundID := false
			for _, id := range o.IDs {
				if id == item.ID() {
					foundID = true
					break
				}
			}
			if len(o.IDs) > 0 && !foundID {
				continue
			}

			foundName := false
			for _, name := range o.Names {
				if o.Matches(name, item.Name()) {
					foundName = true
					break
				}
			}

			if len(o.Names) > 0 && !foundName {
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
	c.watchOnce.Do(func() {
		go c.watch()
	})

	// parse the options, fallback to the default domain
	var wo registry.Options
	for _, o := range opts {
		o(&wo)
	}

	if wo.Context == nil {
		wo.Context = context.Background()
	}

	id := uuid.New()
	res := make(chan registry.Result)

	// construct the watcher
	w := registry.NewWatcher(
		uuid.New(),
		wo,
		res,
	)

	// Sending list once
	items, err := c.List(opts...)
	if err != nil {
		return nil, err
	}

	// We shouldn't block the response
	go func() {
		if len(items) > 0 {
			res <- registry.NewResult(pb.ActionType_CREATE, items)
		}
	}()

	c.broadcastersLock.Lock()
	c.broadcasters[id] = broadcaster{
		Types: wo.Types,
		Ch:    res,
	}
	c.broadcastersLock.Unlock()

	// Wrap in a configWatcher to properly deregister on stop
	cw := &configWatcher{
		Watcher: w,
		onStop: func() {
			c.broadcastersLock.Lock()
			delete(c.broadcasters, id)
			c.broadcastersLock.Unlock()
		},
	}

	return cw, nil
}

func (c *configRegistry) NewLocker(name string) sync.Locker {
	if ds, ok := c.store.(config.DistributedStore); ok {
		return ds.NewLocker(name)
	}

	return nil
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
