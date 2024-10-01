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

package activity

import (
	"context"
	"fmt"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
	"github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var (
	noCache   bool
	cacheConf = cache.Config{
		Prefix:   "activities",
		Eviction: "5m",
	}
	batchPool     *openurl.Pool[indexer.Batch]
	batchPoolInit sync.Once
)

func WithCache(dao DAO, batchTimeout time.Duration) DAO {
	if noCache {
		return dao
	}
	_, useBatch := dao.(BatchDAO)
	return &Cache{
		DAO:          dao,
		useBatch:     useBatch,
		batchTimeout: batchTimeout,
	}
}

type Cache struct {
	DAO
	useBatch     bool
	batchTimeout time.Duration
}

func (c *Cache) CloseConn(ctx context.Context) error {
	// Todo how to close batch
	return nil
}

func (c *Cache) BatchPost(aa []*BatchActivity) error {
	return c.DAO.(BatchDAO).BatchPost(aa)
}

func (c *Cache) PostActivity(ctx context.Context, ownerType activity.OwnerType, ownerId string, boxName BoxName, object *activity.Object, publish bool) error {
	if !c.useBatch {
		return c.DAO.PostActivity(ctx, ownerType, ownerId, boxName, object, publish)
	}

	batchPoolInit.Do(func() {

		batchPool = openurl.MustMemPool[indexer.Batch](ctx, func(ct context.Context, url string) indexer.Batch {
			ct = runtime.WithServiceName(ct, common.ServiceActivityGRPC)
			openCtx := propagator.ForkedBackgroundWithMeta(ct)
			return indexer.NewStackBatch[*BatchActivity](openCtx,
				indexer.WithStackSize[*BatchActivity](500),
				indexer.WithStackExpire[*BatchActivity](c.batchTimeout),
				indexer.WithStackFlush[*BatchActivity](func(batchActivity ...*BatchActivity) error {
					if len(batchActivity) == 0 {
						return nil
					}
					dao, er := manager.Resolve[DAO](ct)
					if er != nil {
						return nil
					}
					log.Logger(ct).Info(fmt.Sprintf("Batch posting %d activities", len(batchActivity)), zap.Any("ac", batchActivity[0]))
					return dao.(BatchDAO).BatchPost(batchActivity)
				}),
			)
		})
	})

	var publishCtx context.Context
	if publish {
		publishCtx = propagator.ForkedBackgroundWithMeta(ctx)
	}
	b, er := batchPool.Get(ctx)
	if er != nil {
		return er
	}
	return b.Insert(&BatchActivity{
		Object:     object,
		OwnerType:  ownerType,
		OwnerId:    ownerId,
		BoxName:    boxName,
		PublishCtx: publishCtx,
	})

}

func (c *Cache) UpdateSubscription(ctx context.Context, subscription *activity.Subscription) error {
	// Clear cache
	if ca, er := cache_helper.ResolveCache(ctx, "shared", cacheConf); er == nil {
		_ = ca.Delete(subscription.ObjectType.String() + "-" + subscription.ObjectId)
	}
	return c.DAO.UpdateSubscription(ctx, subscription)
}

func (c *Cache) ListSubscriptions(ctx context.Context, objectType activity.OwnerType, objectIds []string) (res []*activity.Subscription, e error) {

	var filtered []string
	toCache := make(map[string][]*activity.Subscription)
	ca, _ := cache_helper.ResolveCache(ctx, "shared", cacheConf)

	for _, id := range objectIds {
		// We'll cache an empty slice by default
		toCache[id] = []*activity.Subscription{}

		k := objectType.String() + "-" + id
		if ca != nil {
			if v, ok := ca.GetBytes(k); ok {
				var subs []*activity.Subscription
				if e := jsonx.Unmarshal(v, &subs); e == nil {
					res = append(res, subs...)
					continue
				}
			}
		}
		filtered = append(filtered, id)
	}
	ss, e := c.DAO.ListSubscriptions(ctx, objectType, filtered)
	if e != nil {
		return
	}
	res = append(res, ss...)
	for _, s := range res {
		toCache[s.ObjectId] = append(toCache[s.ObjectId], s)
	}
	if ca != nil {
		for i, t := range toCache {
			if data, e := jsonx.Marshal(t); e == nil {
				_ = ca.Set(objectType.String()+"-"+i, data)
			}
		}
	}
	return
}

func (c *Cache) CountUnreadForUser(ctx context.Context, userId string) int {
	return c.DAO.CountUnreadForUser(ctx, userId)
}

func (c *Cache) ActivitiesFor(ctx context.Context, ownerType activity.OwnerType, ownerId string, boxName BoxName, refBoxOffset BoxName, reverseOffset int64, limit int64, streamFilter string, result chan *activity.Object, done chan bool) error {
	return c.DAO.ActivitiesFor(ctx, ownerType, ownerId, boxName, refBoxOffset, reverseOffset, limit, streamFilter, result, done)
}

func (c *Cache) StoreLastUserInbox(ctx context.Context, userId string, boxName BoxName, activityId string) error {
	return c.DAO.StoreLastUserInbox(ctx, userId, boxName, activityId)
}

func (c *Cache) Delete(ctx context.Context, ownerType activity.OwnerType, ownerId string) error {
	return c.DAO.Delete(ctx, ownerType, ownerId)
}

func (c *Cache) Purge(ctx context.Context, logger func(string, int), ownerType activity.OwnerType, ownerId string, boxName BoxName, minCount, maxCount int, updatedBefore time.Time, compactDB, clearBackup bool) error {
	return c.DAO.Purge(ctx, logger, ownerType, ownerId, boxName, minCount, maxCount, updatedBefore, compactDB, clearBackup)
}

// AllActivities is used for internal migrations only
func (c *Cache) AllActivities(ctx context.Context) (chan *BatchActivity, int, error) {
	return c.DAO.AllActivities(ctx)
}

// AllSubscriptions is used for internal migrations only
func (c *Cache) AllSubscriptions(ctx context.Context) (chan *activity.Subscription, int, error) {
	return c.DAO.AllSubscriptions(ctx)
}
