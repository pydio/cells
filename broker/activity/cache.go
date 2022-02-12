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

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/jsonx"
)

func WithCache(dao DAO) DAO {
	useBatch := false
	if _, o := dao.(batchDAO); o {
		useBatch = true
	}
	return &Cache{
		dao:      dao,
		cache:    cache.NewSharded("activities", cache.WithEviction(5*time.Minute)),
		useBatch: useBatch,
	}
}

type Cache struct {
	dao   DAO
	cache cache.Sharded

	useBatch bool
	done     chan bool
	input    chan *batchActivity
	inner    []*batchActivity
}

func (c *Cache) Init(values configx.Values) error {
	if c.useBatch {
		c.done = make(chan bool)
		c.input = make(chan *batchActivity)
		c.inner = make([]*batchActivity, 0, 500)
		go c.startBatching()
	}
	return c.dao.Init(values)
}

func (c *Cache) startBatching() {
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
	c.dao.(batchDAO).BatchPost(c.inner)
	c.inner = c.inner[:0]
}

func (c *Cache) GetConn() dao.Conn {
	return c.dao.GetConn()
}

func (c *Cache) SetConn(conn dao.Conn) {
	c.dao.SetConn(conn)
}

func (c *Cache) CloseConn() error {
	if c.useBatch {
		c.stopBatching()
	}
	return c.dao.CloseConn()
}

func (c *Cache) Driver() string {
	return c.dao.Driver()
}

func (c *Cache) Prefix() string {
	return c.dao.Prefix()
}

// LocalAccess overrides DAO
func (c *Cache) LocalAccess() bool {
	return c.dao.LocalAccess()
}

func (c *Cache) PostActivity(ownerType activity.OwnerType, ownerId string, boxName BoxName, object *activity.Object, publishCtx context.Context) error {
	if !c.useBatch {
		return c.dao.PostActivity(ownerType, ownerId, boxName, object, publishCtx)
	} else {
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

func (c *Cache) UpdateSubscription(subscription *activity.Subscription) error {
	// Clear cache
	c.cache.Delete(subscription.ObjectType.String() + "-" + subscription.ObjectId)
	return c.dao.UpdateSubscription(subscription)
}

func (c *Cache) ListSubscriptions(objectType activity.OwnerType, objectIds []string) (res []*activity.Subscription, e error) {

	var filtered []string
	toCache := make(map[string][]*activity.Subscription)

	for _, id := range objectIds {
		// We'll cache an empty slice by default
		toCache[id] = []*activity.Subscription{}

		k := objectType.String() + "-" + id
		if v, e := c.cache.Get(k); e == nil {
			var subs []*activity.Subscription
			if e := jsonx.Unmarshal(v, &subs); e == nil {
				res = append(res, subs...)
				continue
			}
		}
		filtered = append(filtered, id)
	}
	ss, e := c.dao.ListSubscriptions(objectType, filtered)
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

func (c *Cache) CountUnreadForUser(userId string) int {
	return c.dao.CountUnreadForUser(userId)
}

func (c *Cache) ActivitiesFor(ownerType activity.OwnerType, ownerId string, boxName BoxName, refBoxOffset BoxName, reverseOffset int64, limit int64, result chan *activity.Object, done chan bool) error {
	return c.dao.ActivitiesFor(ownerType, ownerId, boxName, refBoxOffset, reverseOffset, limit, result, done)
}

func (c *Cache) StoreLastUserInbox(userId string, boxName BoxName, activityId string) error {
	return c.dao.StoreLastUserInbox(userId, boxName, activityId)
}

func (c *Cache) Delete(ownerType activity.OwnerType, ownerId string) error {
	return c.dao.Delete(ownerType, ownerId)
}

func (c *Cache) Purge(logger func(string), ownerType activity.OwnerType, ownerId string, boxName BoxName, minCount, maxCount int, updatedBefore time.Time, compactDB, clearBackup bool) error {
	return c.dao.Purge(logger, ownerType, ownerId, boxName, minCount, maxCount, updatedBefore, compactDB, clearBackup)
}

// AllActivities is used for internal migrations only
func (c *Cache) allActivities() (chan *docActivity, error) {
	return c.dao.allActivities()
}

// AllSubscriptions is used for internal migrations only
func (c *Cache) allSubscriptions() (chan *activity.Subscription, error) {
	return c.dao.allSubscriptions()
}
