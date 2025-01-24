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

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/std"
)

var (
	aclOnce         sync.Once
	ancestorsConfig = cache.Config{
		Prefix:      "acls",
		Eviction:    "60s",
		CleanWindow: "30s",
	}
)

func getAclCache(ctx context.Context) cache.Cache {
	aclOnce.Do(func() {
		// Subscribe - use a background context as incoming context could come from a request !
		_, er := broker.Subscribe(propagator.ForkedBackgroundWithMeta(ctx), common.TopicIdmEvent, func(ct context.Context, message broker.Message) error {
			event := &idm.ChangeEvent{}
			msgCtx, e := message.Unmarshal(ct, event)
			if e != nil {
				return e
			}
			switch event.Type {
			case idm.ChangeEventType_CREATE, idm.ChangeEventType_UPDATE, idm.ChangeEventType_DELETE:
				if ka, er := cache_helper.ResolveCache(msgCtx, common.CacheTypeLocal, ancestorsConfig); er == nil {
					return ka.Reset()
				} else {
					log.Logger(msgCtx).Error("Cannot resolve Acl Cache for invalidation", zap.Error(er))
				}
			}
			return nil
		}, broker.WithCounterName("acl-cache"))
		if er != nil {
			log.Logger(ctx).Error("Cannot subscribe to TopicIdmEvent for AclCache", zap.Error(er))
		}
	})
	return cache_helper.MustResolveCache(ctx, common.CacheTypeLocal, ancestorsConfig)
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
