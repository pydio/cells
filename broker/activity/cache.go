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
	"time"

	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/jsonx"
)

func WithCache(dao DAO) DAO {
	useBatch := false
	if _, o := dao.(batchDAO); o {
		useBatch = true
	}
	c, _ := cache.OpenCache(context.TODO(), runtime.CacheURL("activities", "evictionTime", "5m"))
	return &Cache{
		DAO:      dao,
		cache:    c,
		useBatch: useBatch,
	}
}

type Cache struct {
	DAO
	cache cache.Cache

	useBatch bool
	done     chan bool
	input    chan *batchActivity
	inner    []*batchActivity

	closed bool
}

func (c *Cache) Init(ctx context.Context, values configx.Values) error {
	if c.useBatch {
		c.done = make(chan bool)
		c.input = make(chan *batchActivity)
		c.inner = make([]*batchActivity, 0, 500)
		go c.startBatching()
	}
	return c.DAO.Init(ctx, values)
}

func (c *Cache) startBatching() {
	defer func() {
		c.closed = true
		close(c.input)
	}()
	for {
		select {
		case a := <-c.input:
			c.inner = append(c.inner, a)
			if len(c.inner) >= 500 {
				c.flushBatch()
			}
		case <-time.After(5 * time.Second):
			c.flushBatch()
		case <-c.done:
			c.flushBatch()
			return
		}
	}
}

func (c *Cache) stopBatching() {
	close(c.done)
}

func (c *Cache) flushBatch() {
	if len(c.inner) == 0 {
		return
	}
	c.DAO.(batchDAO).BatchPost(c.inner)
	c.inner = c.inner[:0]
}

func (c *Cache) CloseConn(ctx context.Context) error {
	if c.useBatch {
		c.stopBatching()
	}
	return c.DAO.CloseConn(ctx)
}

func (c *Cache) PostActivity(ctx context.Context, ownerType activity.OwnerType, ownerId string, boxName BoxName, object *activity.Object, publish bool) error {
	if !c.useBatch || c.closed {
		return c.DAO.PostActivity(ctx, ownerType, ownerId, boxName, object, publish)
	} else {
		var publishCtx context.Context
		if publish {
			publishCtx = runtime.ForkContext(context.Background(), ctx)
		}
		c.input <- &batchActivity{
			Object:     object,
			ownerType:  ownerType,
			ownerId:    ownerId,
			boxName:    boxName,
			publishCtx: publishCtx,
		}
		return nil
	}
}

func (c *Cache) UpdateSubscription(ctx context.Context, subscription *activity.Subscription) error {
	// Clear cache
	c.cache.Delete(subscription.ObjectType.String() + "-" + subscription.ObjectId)
	return c.DAO.UpdateSubscription(ctx, subscription)
}

func (c *Cache) ListSubscriptions(ctx context.Context, objectType activity.OwnerType, objectIds []string) (res []*activity.Subscription, e error) {

	var filtered []string
	toCache := make(map[string][]*activity.Subscription)

	for _, id := range objectIds {
		// We'll cache an empty slice by default
		toCache[id] = []*activity.Subscription{}

		k := objectType.String() + "-" + id
		if v, ok := c.cache.GetBytes(k); ok {
			var subs []*activity.Subscription
			if e := jsonx.Unmarshal(v, &subs); e == nil {
				res = append(res, subs...)
				continue
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
	for i, t := range toCache {
		if data, e := jsonx.Marshal(t); e == nil {
			c.cache.Set(objectType.String()+"-"+i, data)
		}
	}
	return
}

func (c *Cache) CountUnreadForUser(ctx context.Context, userId string) int {
	return c.DAO.CountUnreadForUser(ctx, userId)
}

func (c *Cache) ActivitiesFor(ctx context.Context, ownerType activity.OwnerType, ownerId string, boxName BoxName, refBoxOffset BoxName, reverseOffset int64, limit int64, result chan *activity.Object, done chan bool) error {
	return c.DAO.ActivitiesFor(ctx, ownerType, ownerId, boxName, refBoxOffset, reverseOffset, limit, result, done)
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
func (c *Cache) allActivities(ctx context.Context) (chan *docActivity, int, error) {
	return c.DAO.allActivities(ctx)
}

// AllSubscriptions is used for internal migrations only
func (c *Cache) allSubscriptions(ctx context.Context) (chan *activity.Subscription, int, error) {
	return c.DAO.allSubscriptions(ctx)
}
