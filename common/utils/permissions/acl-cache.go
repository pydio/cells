/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package permissions

import (
	"context"
	"sync"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/std"
)

var (
	aclCachePool *openurl.Pool[cache.Cache]
	aclOnce      sync.Once
)

func getAclCache(ctx context.Context) cache.Cache {
	aclOnce.Do(func() {
		// Init pool
		aclCachePool = cache.MustOpenPool(runtime.ShortCacheURL("evictionTime", "60s", "cleanWindow", "30s"))

		// Subscribe
		_, _ = broker.Subscribe(context.Background(), common.TopicIdmEvent, func(ct context.Context, message broker.Message) error {
			event := &idm.ChangeEvent{}
			msgCtx, e := message.Unmarshal(ct, event)
			if e != nil {
				return e
			}
			switch event.Type {
			case idm.ChangeEventType_CREATE, idm.ChangeEventType_UPDATE, idm.ChangeEventType_DELETE:
				if ka, er := aclCachePool.Get(msgCtx); er == nil {
					return ka.Reset()
				}
			}
			return nil
		}, broker.WithCounterName("acl-cache"))
	})

	if ka, er := aclCachePool.Get(ctx); er == nil {
		return ka
	} else {
		return cache.MustDiscard()
	}
}

type CachedAccessList struct {
	Wss             map[string]*idm.Workspace
	WssRootsMasks   map[string]map[string]Bitmask
	OrderedRoles    []*idm.Role
	WsACLs          []*idm.ACL
	FrontACLs       []*idm.ACL
	MasksByUUIDs    map[string]Bitmask
	MasksByPaths    map[string]Bitmask
	ClaimsScopes    map[string]Bitmask
	HasClaimsScopes bool
}

// cache uses the CachedAccessList struct with public fields for cache serialization
func (a *AccessList) cache(ctx context.Context, key string) error {
	a.cacheKey = key
	a.maskBPLock.RLock()
	a.maskBULock.RLock()
	a.maskRootsLock.RLock()
	defer a.maskBPLock.RUnlock()
	defer a.maskBULock.RUnlock()
	defer a.maskRootsLock.RUnlock()
	m := &CachedAccessList{
		OrderedRoles:    a.orderedRoles,
		WsACLs:          a.wsACLs,
		FrontACLs:       a.frontACLs,
		HasClaimsScopes: a.hasClaimsScopes,
		Wss:             std.CloneMap(a.wss),
		WssRootsMasks:   std.CloneMap(a.wssRootsMasks),
		MasksByUUIDs:    std.CloneMap(a.masksByUUIDs),
		MasksByPaths:    std.CloneMap(a.masksByPaths),
		ClaimsScopes:    std.CloneMap(a.claimsScopes),
	}

	return getAclCache(ctx).Set(key, m)
}

// newFromCache looks up for a CachedAccessList struct in the cache and init an AccessList with the values.
func newFromCache(ctx context.Context, key string) (*AccessList, bool) {
	m := &CachedAccessList{}
	if b := getAclCache(ctx).Get(key, &m); !b {
		//fmt.Println("Get from cache ", key)
		return nil, b
	}
	a := &AccessList{
		// Use cached value directly
		orderedRoles:    m.OrderedRoles,
		wsACLs:          m.WsACLs,
		frontACLs:       m.FrontACLs,
		hasClaimsScopes: m.HasClaimsScopes,
		cacheKey:        key,
		// Re-init these
		maskBPLock:    &sync.RWMutex{},
		maskBULock:    &sync.RWMutex{},
		maskRootsLock: &sync.RWMutex{},
		wss:           std.CloneMap(m.Wss),
		wssRootsMasks: std.CloneMap(m.WssRootsMasks),
		masksByUUIDs:  std.CloneMap(m.MasksByUUIDs),
		masksByPaths:  std.CloneMap(m.MasksByPaths),
		claimsScopes:  std.CloneMap(m.ClaimsScopes),
	}

	return a, true
}
