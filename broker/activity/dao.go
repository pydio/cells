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
	PostActivity(ownerType activity.OwnerType, ownerId string, boxName BoxName, object *activity.Object, publishCtx context.Context) error

	// UpdateSubscription updates Subscriptions status.
	UpdateSubscription(subscription *activity.Subscription) error

	// ListSubscriptions lists subs on a given object.
	// Returns a map of userId => status (true/false, required to disable default subscriptions like workspaces).
	ListSubscriptions(objectType activity.OwnerType, objectIds []string) ([]*activity.Subscription, error)

	// CountUnreadForUser counts the number of unread activities in user "Inbox" box.
	CountUnreadForUser(userId string) int

	// ActivitiesFor loads activities for a given owner. Targets "outbox" by default.
	ActivitiesFor(ownerType activity.OwnerType, ownerId string, boxName BoxName, refBoxOffset BoxName, reverseOffset int64, limit int64, result chan *activity.Object, done chan bool) error

	// StoreLastUserInbox stores the last read uint ID for a given box.
	StoreLastUserInbox(userId string, boxName BoxName, activityId string) error

	// Delete should be wired to "USER_DELETE" and "NODE_DELETE" events
	// to remove (or archive?) deprecated queues
	Delete(ownerType activity.OwnerType, ownerId string) error

	// Purge removes records based on a maximum number of records and/or based on the activity update date
	// It keeps at least minCount record(s) - to see last activity - even if older than expected date
	Purge(logger func(string), ownerType activity.OwnerType, ownerId string, boxName BoxName, minCount, maxCount int, updatedBefore time.Time, compactDB, clearBackup bool) error
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
