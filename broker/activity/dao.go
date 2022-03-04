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

// Package activity stores and distributes events to users in a social-feed manner.
//
// It is composed of two services, one GRPC for persistence layer and one REST for logic.
// Persistence is currently only implemented using a BoltDB store.
package activity

import (
	"context"
	"time"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/activity"
)

var testEnv bool

type BoxName string

const (
	BoxInbox         BoxName = "inbox"
	BoxOutbox        BoxName = "outbox"
	BoxSubscriptions BoxName = "subscriptions"
	BoxLastRead      BoxName = "lastread"
	BoxLastSent      BoxName = "lastsent"
)

type DAO interface {
	dao.DAO

	// PostActivity posts an activity to target inbox.
	PostActivity(ctx context.Context, ownerType activity.OwnerType, ownerId string, boxName BoxName, object *activity.Object, publish bool) error

	// UpdateSubscription updates Subscriptions status.
	UpdateSubscription(ctx context.Context, subscription *activity.Subscription) error

	// ListSubscriptions lists subs on a given object.
	// Returns a map of userId => status (true/false, required to disable default subscriptions like workspaces).
	ListSubscriptions(ctx context.Context, objectType activity.OwnerType, objectIds []string) ([]*activity.Subscription, error)

	// CountUnreadForUser counts the number of unread activities in user "Inbox" box.
	CountUnreadForUser(ctx context.Context, userId string) int

	// ActivitiesFor loads activities for a given owner. Targets "outbox" by default.
	ActivitiesFor(ctx context.Context, ownerType activity.OwnerType, ownerId string, boxName BoxName, refBoxOffset BoxName, reverseOffset int64, limit int64, result chan *activity.Object, done chan bool) error

	// StoreLastUserInbox stores the last read uint ID for a given box.
	StoreLastUserInbox(ctx context.Context, userId string, boxName BoxName, activityId string) error

	// Delete should be wired to "USER_DELETE" and "NODE_DELETE" events
	// to remove (or archive?) deprecated queues
	Delete(ctx context.Context, ownerType activity.OwnerType, ownerId string) error

	// Purge removes records based on a maximum number of records and/or based on the activity update date
	// It keeps at least minCount record(s) - to see last activity - even if older than expected date
	Purge(ctx context.Context, logger func(string), ownerType activity.OwnerType, ownerId string, boxName BoxName, minCount, maxCount int, updatedBefore time.Time, compactDB, clearBackup bool) error

	// AllActivities is used for internal migrations only
	allActivities(ctx context.Context) (chan *docActivity, error)
	// AllSubscriptions is used for internal migrations only
	allSubscriptions(ctx context.Context) (chan *activity.Subscription, error)
}

type batchActivity struct {
	*activity.Object
	ownerType  activity.OwnerType
	ownerId    string
	boxName    BoxName
	publishCtx context.Context
}

type batchDAO interface {
	BatchPost([]*batchActivity) error
}

func NewDAO(o dao.DAO) dao.DAO {
	switch v := o.(type) {
	case boltdb.DAO:
		bi := &boltdbimpl{DAO: v, InboxMaxSize: 1000}
		if testEnv {
			return bi
		} else {
			return WithCache(bi)
		}
	case mongodb.DAO:
		mi := &mongoimpl{DAO: v}
		return mi
	}
	return nil
}

func Migrate(f dao.DAO, t dao.DAO, dryRun bool) (map[string]int, error) {
	ctx := context.Background()
	out := map[string]int{
		"Activities":    0,
		"Subscriptions": 0,
	}
	testEnv = true // Disable cache
	from := NewDAO(f).(DAO)
	to := NewDAO(t).(DAO)
	aa, er := from.allActivities(ctx)
	if er != nil {
		return nil, er
	}
	for a := range aa {
		if dryRun {
			out["Activities"]++
		} else if er := to.PostActivity(ctx, activity.OwnerType(a.OwnerType), a.OwnerId, BoxName(a.BoxName), a.Object, false); er == nil {
			out["Activities"]++
		} else {
			continue
		}
	}
	ss, er := from.allSubscriptions(ctx)
	if er != nil {
		return out, er
	}
	for s := range ss {
		if dryRun {
			out["Subscriptions"]++
		} else if er := to.UpdateSubscription(ctx, s); er == nil {
			out["Subscriptions"]++
		} else {
			continue
		}
	}
	return out, nil
}
