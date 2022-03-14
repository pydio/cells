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

package activity

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/log"
	"go.uber.org/zap"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

const (
	collActivities    = "activities"
	collSubscriptions = "subscriptions"
	collMarkers       = "markers"
)

var (
	model = mongodb.Model{
		Collections: []mongodb.Collection{
			{
				Name: collActivities,
				Indexes: []map[string]int{
					{"ac_id": 1},
					{"ts": -1},
					{"owner_type": 1, "owner_id": 1, "box_name": 1},
				},
			},
			{
				Name: collSubscriptions,
				Indexes: []map[string]int{
					{"objectype": 1, "objectid": 1},
					{"objectype": 1, "objectid": 1, "userid": 1},
				},
			},
			{
				Name: collMarkers,
				Indexes: []map[string]int{
					{"box_name": 1, "user_id": 1},
				},
			},
		},
	}
)

type mongoimpl struct {
	mongodb.DAO
}

type docMarker struct {
	BoxName   string `bson:"box_name"`
	UserId    string `bson:"user_id"`
	Timestamp int64  `bson:"timestamp"`
}

type docActivity struct {
	OwnerType int32  `bson:"owner_type"`
	OwnerId   string `bson:"owner_id"`
	BoxName   string `bson:"box_name"`
	Ts        int64  `bson:"ts"`
	AcId      string `bson:"ac_id"`
	*activity.Object
}

type docActivityProjection struct {
	Ts   int64  `bson:"ts"`
	AcId string `bson:"ac_id"`
}

func (m *mongoimpl) Init(values configx.Values) error {
	if er := model.Init(context.Background(), m.DB()); er != nil {
		return er
	}
	return m.DAO.Init(values)
}

func (m *mongoimpl) UpdateSubscription(ctx context.Context, subscription *activity.Subscription) error {
	selector := bson.D{
		{"objecttype", subscription.ObjectType},
		{"objectid", subscription.ObjectId},
		{"userid", subscription.UserId},
	}
	if len(subscription.Events) == 0 {
		// Remove subscription
		_, e := m.DB().Collection(collSubscriptions).DeleteOne(ctx, selector)
		if e != nil {
			return e
		}
		//fmt.Println("Deleted", r.DeletedCount, collSubscriptions)
		return nil
	}
	upsert := true
	_, e := m.DB().Collection(collSubscriptions).ReplaceOne(ctx, selector, subscription, &options.ReplaceOptions{Upsert: &upsert})
	if e != nil {
		return e
	}
	//fmt.Println(res.ModifiedCount, res.UpsertedCount)
	return nil
}

func (m *mongoimpl) ListSubscriptions(ctx context.Context, objectType activity.OwnerType, objectIds []string) (ss []*activity.Subscription, err error) {
	if len(objectIds) == 0 {
		return
	}
	selector := bson.D{
		{"objecttype", objectType},
	}
	if len(objectIds) == 1 {
		selector = append(selector, bson.E{"objectid", objectIds[0]})
	} else {
		selector = append(selector, bson.E{"objectid", bson.M{"$in": objectIds}})
	}
	cursor, er := m.DB().Collection(collSubscriptions).Find(ctx, selector)
	if er != nil {
		return nil, er
	}
	for cursor.Next(ctx) {
		sub := &activity.Subscription{}
		if e := cursor.Decode(sub); e != nil {
			return nil, e
		}
		ss = append(ss, sub)
	}
	return
}

func (m *mongoimpl) PostActivity(ctx context.Context, ownerType activity.OwnerType, ownerId string, boxName BoxName, object *activity.Object, publish bool) error {
	object.Id = "/activity-" + uuid.New()
	doc := &docActivity{
		OwnerType: int32(ownerType),
		OwnerId:   ownerId,
		BoxName:   string(boxName),
		Ts:        time.Now().UnixNano(),
		AcId:      object.Id,
		Object:    object,
	}
	if object.Updated != nil && object.Updated.IsValid() {
		doc.Ts = time.Unix(object.Updated.GetSeconds(), int64(object.Updated.GetNanos())).UnixNano()
	}
	_, er := m.DB().Collection(collActivities).InsertOne(ctx, doc)
	if er == nil {
		if publish {
			broker.MustPublish(ctx, common.TopicActivityEvent, &activity.PostActivityEvent{
				OwnerType: ownerType,
				OwnerId:   ownerId,
				BoxName:   string(boxName),
				Activity:  object,
			})
		}
	}
	return er
}

func (m *mongoimpl) ActivitiesFor(ctx context.Context, ownerType activity.OwnerType, ownerId string, boxName BoxName, refBoxOffset BoxName, reverseOffset int64, limit int64, result chan *activity.Object, done chan bool) error {
	defer func() {
		done <- true
	}()
	if boxName == "" {
		boxName = BoxOutbox
	}
	filter := bson.D{
		{"owner_type", int(ownerType)},
		{"owner_id", ownerId},
		{"box_name", string(boxName)},
	}
	if refBoxOffset != "" {
		if lastRead := m.userLastMarker(ctx, ownerId, refBoxOffset); lastRead > 0 {
			filter = append(filter, bson.E{Key: "ts", Value: bson.M{"$gt": lastRead}})
		}
	}
	if limit == 0 && refBoxOffset == "" {
		limit = 20
	}
	opts := &options.FindOptions{
		Sort: bson.D{{"ts", -1}},
	}
	if reverseOffset > 0 {
		opts.Skip = &reverseOffset
	}
	if limit > 0 {
		opts.Limit = &limit
	}
	cursor, er := m.DB().Collection(collActivities).Find(ctx, filter, opts)
	if er != nil {
		return er
	}
	var userLastRead int64
	for cursor.Next(ctx) {
		doc := &docActivity{}
		if er := cursor.Decode(doc); er != nil {
			return er
		}
		if userLastRead == 0 {
			userLastRead = doc.Ts // store first timestamp (more recent) as last read
		}
		result <- doc.Object
	}

	if refBoxOffset != BoxLastSent && ownerType == activity.OwnerType_USER && boxName == BoxInbox && userLastRead > 0 {
		// Store last read in dedicated box
		go func() {
			if er := m.storeLastUserInbox(ctx, ownerId, BoxLastRead, userLastRead); er != nil {
				log.Logger(ctx).Error("Cannot storeLastUserInbox", zap.Error(er))
			}
		}()
	}

	return nil
}

func (m *mongoimpl) CountUnreadForUser(ctx context.Context, userId string) int {
	filter := bson.D{
		{"owner_type", int(activity.OwnerType_USER)},
		{"owner_id", userId},
		{"box_name", string(BoxInbox)},
	}
	if lastRead := m.userLastMarker(ctx, userId, BoxLastRead); lastRead > 0 {
		filter = append(filter, bson.E{"ts", bson.E{"$gt", lastRead}})
	}
	count, e := m.DB().Collection(collActivities).CountDocuments(ctx, filter)
	if e != nil {
		return 0
	}
	return int(count)
}

func (m *mongoimpl) StoreLastUserInbox(ctx context.Context, userId string, boxName BoxName, activityId string) error {
	// Find activity by id
	res := m.DB().Collection(collActivities).FindOne(ctx, bson.D{{"ac_id", activityId}})
	if res.Err() != nil {
		return res.Err()
	}
	doc := &docActivity{}
	if er := res.Decode(doc); er != nil {
		return er
	}
	return m.storeLastUserInbox(ctx, userId, boxName, doc.Ts)
}

func (m *mongoimpl) storeLastUserInbox(ctx context.Context, userId string, boxName BoxName, timestamp int64) error {
	marker := &docMarker{
		UserId:    userId,
		BoxName:   string(boxName),
		Timestamp: timestamp,
	}
	filter := bson.D{{"user_id", userId}, {"box_name", string(boxName)}}
	upsert := true
	_, e := m.DB().Collection(collMarkers).ReplaceOne(ctx, filter, marker, &options.ReplaceOptions{Upsert: &upsert})
	if e != nil {
		return e
	}
	return nil
}

func (m *mongoimpl) Delete(ctx context.Context, ownerType activity.OwnerType, ownerId string) error {
	filter := bson.D{
		{"owner_type", int(ownerType)},
		{"owner_id", ownerId},
	}
	_, e := m.DB().Collection(collActivities).DeleteMany(ctx, filter)
	if e != nil {
		return e
	}

	if ownerType != activity.OwnerType_USER {
		return nil
	}

	// Clear Subscriptions
	res, e := m.DB().Collection(collSubscriptions).DeleteMany(ctx, bson.D{{"userid", ownerId}})
	if e != nil {
		return e
	}
	log.Logger(ctx).Debug(fmt.Sprintf("Cleared %d subscriptions for user %s", res.DeletedCount, ownerId))

	//  Clear activities where Actor.Id = userId
	res, e = m.DB().Collection(collActivities).DeleteMany(ctx, bson.D{{"object.actor.id", ownerId}})
	if e != nil {
		return e
	}
	log.Logger(ctx).Debug(fmt.Sprintf("Cleared %d activities whose Actor was %s", res.DeletedCount, ownerId))

	return nil
}

func (m *mongoimpl) Purge(ctx context.Context, logger func(string), ownerType activity.OwnerType, ownerId string, boxName BoxName, minCount, maxCount int, updatedBefore time.Time, compactDB, clearBackup bool) error {
	if ownerId == "*" {
		// Distinct and run on all boxes
		dd, e := m.DB().Collection(collActivities).Distinct(ctx, "owner_id", bson.D{{"owner_type", int(ownerType)}, {"box_name", string(boxName)}})
		if e != nil {
			return e
		}
		for _, i := range dd {
			if er := m.purgeOneBox(ctx, logger, ownerType, i.(string), boxName, int64(minCount), int64(maxCount), updatedBefore.UnixNano()); er != nil {
				return er
			}
		}
		return nil
	} else {
		return m.purgeOneBox(ctx, logger, ownerType, ownerId, boxName, int64(minCount), int64(maxCount), updatedBefore.UnixNano())
	}
}

// AllActivities is used for internal migrations only
func (m *mongoimpl) allActivities(ctx context.Context) (chan *docActivity, error) {
	filter := bson.D{}
	opts := &options.FindOptions{
		Sort: bson.D{{"ts", 1}},
	}
	cursor, er := m.DB().Collection(collActivities).Find(ctx, filter, opts)
	if er != nil {
		return nil, er
	}
	out := make(chan *docActivity, 10000)
	go func() {
		defer close(out)
		for cursor.Next(context.Background()) {
			doc := &docActivity{}
			if er := cursor.Decode(doc); er != nil {
				continue
			}
			out <- doc
		}
	}()
	return out, nil
}

// AllSubscriptions is used for internal migrations only
func (m *mongoimpl) allSubscriptions(ctx context.Context) (chan *activity.Subscription, error) {
	cursor, er := m.DB().Collection(collSubscriptions).Find(ctx, bson.D{})
	if er != nil {
		return nil, er
	}
	out := make(chan *activity.Subscription, 10000)
	go func() {
		defer close(out)
		for cursor.Next(ctx) {
			sub := &activity.Subscription{}
			if e := cursor.Decode(sub); e != nil {
				continue
			}
			out <- sub
		}
	}()
	return out, nil

}

func (m *mongoimpl) purgeOneBox(ctx context.Context, logger func(string), ownerType activity.OwnerType, ownerId string, boxName BoxName, minCount, maxCount, updatedBefore int64) error {
	filter := bson.D{
		{"owner_type", int(ownerType)},
		{"owner_id", ownerId},
		{"box_name", string(boxName)},
	}
	opts := &options.FindOptions{
		Sort:       bson.D{{"ts", -1}},
		Projection: bson.D{{"ts", 1}, {"ac_id", 1}},
	}
	c, e := m.DB().Collection(collActivities).Find(ctx, filter, opts)
	if e != nil {
		return e
	}
	i := int64(0)
	totalLeft := int64(0)
	var ids []string
	for c.Next(ctx) {
		p := &docActivityProjection{}
		if c.Decode(p) == nil {
			//fmt.Println("Found", p.AcId, p.Ts, p.Ts < updatedBefore)
			if minCount > 0 && i < minCount {
				i++
				totalLeft++
				continue
			}
			i++
			if (maxCount > 0 && totalLeft >= maxCount) || (updatedBefore > 0 && p.Ts < updatedBefore) {
				logger(fmt.Sprintf("Should purge activity %s for %s's %s", p.AcId, ownerId, boxName))
				ids = append(ids, p.AcId)
				continue
			}
			totalLeft++
		}
	}
	if len(ids) > 0 {
		_, e := m.DB().Collection(collActivities).DeleteMany(ctx, bson.D{{"ac_id", bson.M{"$in": ids}}})
		if e == nil {
			//fmt.Println("Removed", res.DeletedCount)
		}
		return e
	}
	return nil
}

func (m *mongoimpl) userLastMarker(ctx context.Context, userId string, boxName BoxName) int64 {
	s := m.DB().Collection(collMarkers).FindOne(ctx, bson.D{{"user_id", userId}, {"box_name", string(boxName)}})
	if s.Err() != nil {
		return 0
	}
	marker := &docMarker{}
	if er := s.Decode(marker); er != nil {
		return 0
	}
	return marker.Timestamp
}
