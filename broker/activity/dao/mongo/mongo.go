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

package mongo

import (
	"context"
	"fmt"
	"time"

	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/broker/activity"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	proto "github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/storage/mongodb"
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

func init() {
	activity.Drivers.Register(NewMongoDAO)
}

func NewMongoDAO(database *mongodb.Database) activity.DAO {
	return &mongoimpl{Database: database}
}

type mongoimpl struct {
	*mongodb.Database
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
	*proto.Object
}

type docActivityProjection struct {
	Ts   int64  `bson:"ts"`
	AcId string `bson:"ac_id"`
}

func (m *mongoimpl) Init(ctx context.Context, values configx.Values) error {
	return model.Init(ctx, m.Database)
}

func (m *mongoimpl) UpdateSubscription(ctx context.Context, subscription *proto.Subscription) error {
	selector := bson.D{
		{"objecttype", subscription.ObjectType},
		{"objectid", subscription.ObjectId},
		{"userid", subscription.UserId},
	}
	if len(subscription.Events) == 0 {
		// Remove subscription
		_, e := m.Collection(collSubscriptions).DeleteOne(ctx, selector)
		if e != nil {
			return e
		}
		//fmt.Println("Deleted", r.DeletedCount, collSubscriptions)
		return nil
	}
	upsert := true
	_, e := m.Collection(collSubscriptions).ReplaceOne(ctx, selector, subscription, &options.ReplaceOptions{Upsert: &upsert})
	if e != nil {
		return e
	}
	//fmt.Println(res.ModifiedCount, res.UpsertedCount)
	return nil
}

func (m *mongoimpl) ListSubscriptions(ctx context.Context, objectType proto.OwnerType, objectIds []string) (ss []*proto.Subscription, err error) {
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
	cursor, er := m.Collection(collSubscriptions).Find(ctx, selector)
	if er != nil {
		return nil, er
	}
	for cursor.Next(ctx) {
		sub := &proto.Subscription{}
		if e := cursor.Decode(sub); e != nil {
			return nil, e
		}
		ss = append(ss, sub)
	}
	return
}

func (m *mongoimpl) PostActivity(ctx context.Context, ownerType proto.OwnerType, ownerId string, boxName activity.BoxName, object *proto.Object, publish bool) error {
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
	_, er := m.Collection(collActivities).InsertOne(ctx, doc)
	if er == nil {
		if publish {
			broker.MustPublish(ctx, common.TopicActivityEvent, &proto.PostActivityEvent{
				OwnerType: ownerType,
				OwnerId:   ownerId,
				BoxName:   string(boxName),
				Activity:  object,
			})
		}
	}
	return er
}

func (m *mongoimpl) ActivitiesFor(ctx context.Context, ownerType proto.OwnerType, ownerId string, boxName activity.BoxName, refBoxOffset activity.BoxName, reverseOffset int64, limit int64, streamFilter string, result chan *proto.Object, done chan bool) error {
	defer func() {
		done <- true
	}()
	if boxName == "" {
		boxName = activity.BoxOutbox
	}
	filter := bson.D{
		{"owner_type", int(ownerType)},
		{"owner_id", ownerId},
		{"box_name", string(boxName)},
	}
	if streamFilter != "" {
		var fieldErs []error
		if additionalFilters, err := mongodb.BleveQueryToMongoFilters(streamFilter, true, func(s string) string {
			var fe error
			if s, fe = activity.QueryFieldsTransformer(s); fe != nil {
				fieldErs = append(fieldErs, fe)
			}
			if s == "updated" {
				s = "updated.seconds"
			}
			return "object." + s
		}); err != nil {
			return err
		} else if len(fieldErs) > 0 {
			return fieldErs[0]
		} else if len(additionalFilters) > 0 {
			filter = append(filter, additionalFilters...)
		}
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
	cursor, er := m.Collection(collActivities).Find(ctx, filter, opts)
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

	if refBoxOffset != activity.BoxLastSent && ownerType == proto.OwnerType_USER && boxName == activity.BoxInbox && userLastRead > 0 {
		// Store last read in dedicated box
		go func() {
			if er := m.storeLastUserInbox(ctx, ownerId, activity.BoxLastRead, userLastRead); er != nil {
				log.Logger(ctx).Error("Cannot storeLastUserInbox", zap.Error(er))
			}
		}()
	}

	return nil
}

func (m *mongoimpl) CountUnreadForUser(ctx context.Context, userId string) int {
	filter := bson.D{
		{"owner_type", int(proto.OwnerType_USER)},
		{"owner_id", userId},
		{"box_name", string(activity.BoxInbox)},
	}
	if lastRead := m.userLastMarker(ctx, userId, activity.BoxLastRead); lastRead > 0 {
		filter = append(filter, bson.E{"ts", bson.E{"$gt", lastRead}})
	}
	count, e := m.Collection(collActivities).CountDocuments(ctx, filter)
	if e != nil {
		return 0
	}
	return int(count)
}

func (m *mongoimpl) StoreLastUserInbox(ctx context.Context, userId string, boxName activity.BoxName, activityId string) error {
	// Find activity by id
	res := m.Collection(collActivities).FindOne(ctx, bson.D{{"ac_id", activityId}})
	if res.Err() != nil {
		return res.Err()
	}
	doc := &docActivity{}
	if er := res.Decode(doc); er != nil {
		return er
	}
	return m.storeLastUserInbox(ctx, userId, boxName, doc.Ts)
}

func (m *mongoimpl) storeLastUserInbox(ctx context.Context, userId string, boxName activity.BoxName, timestamp int64) error {
	marker := &docMarker{
		UserId:    userId,
		BoxName:   string(boxName),
		Timestamp: timestamp,
	}
	filter := bson.D{{"user_id", userId}, {"box_name", string(boxName)}}
	upsert := true
	_, e := m.Collection(collMarkers).ReplaceOne(ctx, filter, marker, &options.ReplaceOptions{Upsert: &upsert})
	if e != nil {
		return e
	}
	return nil
}

func (m *mongoimpl) Delete(ctx context.Context, ownerType proto.OwnerType, ownerId string) error {
	filter := bson.D{
		{"owner_type", int(ownerType)},
		{"owner_id", ownerId},
	}
	_, e := m.Collection(collActivities).DeleteMany(ctx, filter)
	if e != nil {
		return e
	}

	if ownerType != proto.OwnerType_USER {
		return nil
	}

	// Clear Subscriptions
	res, e := m.Collection(collSubscriptions).DeleteMany(ctx, bson.D{{"userid", ownerId}})
	if e != nil {
		return e
	}
	log.Logger(ctx).Debug(fmt.Sprintf("Cleared %d subscriptions for user %s", res.DeletedCount, ownerId))

	//  Clear activities where Actor.Id = userId
	res, e = m.Collection(collActivities).DeleteMany(ctx, bson.D{{"object.actor.id", ownerId}})
	if e != nil {
		return e
	}
	log.Logger(ctx).Debug(fmt.Sprintf("Cleared %d activities whose Actor was %s", res.DeletedCount, ownerId))

	return nil
}

func (m *mongoimpl) Purge(ctx context.Context, logger func(string, int), ownerType proto.OwnerType, ownerId string, boxName activity.BoxName, minCount, maxCount int, updatedBefore time.Time, compactDB, clearBackup bool) error {
	if ownerId == "*" {
		log.Logger(ctx).Info("Running Aggregation to purge activities")
		/*
			// As .Distinct() usage may hit the 16mb document limit, we use aggregation instead
			dd, e := m.Collection(collActivities).Distinct(ctx, "owner_id", bson.D{{"owner_type", int(OwnerType)}, {"box_name", string(BoxName)}})
		*/
		pipeline := bson.A{}
		pipeline = append(pipeline, bson.M{"$match": bson.D{{"owner_type", int(ownerType)}, {"box_name", string(boxName)}}})
		pipeline = append(pipeline, bson.M{"$group": bson.M{"_id": "$owner_id"}})
		allowDiskUse := true
		cursor, e := m.Collection(collActivities).Aggregate(ctx, pipeline, &options.AggregateOptions{AllowDiskUse: &allowDiskUse})
		if e != nil {
			log.Logger(ctx).Error("Error while running aggregation", zap.Error(e))
			return e
		}
		var dd []string
		for cursor.Next(ctx) {
			doc := make(map[string]interface{})
			if er := cursor.Decode(&doc); er != nil {
				continue
			}
			if id, ok := doc["_id"]; ok {
				dd = append(dd, id.(string))
			}
		}

		for _, id := range dd {
			if er := m.purgeOneBox(ctx, logger, ownerType, id, boxName, int64(minCount), int64(maxCount), updatedBefore.UnixNano()); er != nil {
				return er
			}
		}
		return nil
	} else {
		return m.purgeOneBox(ctx, logger, ownerType, ownerId, boxName, int64(minCount), int64(maxCount), updatedBefore.UnixNano())
	}
}

// AllActivities is used for internal migrations only
func (m *mongoimpl) AllActivities(ctx context.Context) (chan *activity.BatchActivity, int, error) {
	filter := bson.D{}
	opts := &options.FindOptions{
		Sort: bson.D{{"ts", 1}},
	}
	var total int
	if tt, e := m.Collection(collActivities).CountDocuments(ctx, nil); e == nil {
		total = int(tt)
	}
	cursor, er := m.Collection(collActivities).Find(ctx, filter, opts)
	if er != nil {
		return nil, 0, er
	}
	out := make(chan *activity.BatchActivity, 10000)
	go func() {
		defer close(out)
		for cursor.Next(context.Background()) {
			doc := &docActivity{}
			if er := cursor.Decode(doc); er != nil {
				continue
			}
			out <- &activity.BatchActivity{
				Object:    doc.Object,
				OwnerType: proto.OwnerType(doc.OwnerType),
				OwnerId:   doc.OwnerId,
				BoxName:   activity.BoxName(doc.BoxName),
			}
		}
	}()
	return out, total, nil
}

// AllSubscriptions is used for internal migrations only
func (m *mongoimpl) AllSubscriptions(ctx context.Context) (chan *proto.Subscription, int, error) {
	cursor, er := m.Collection(collSubscriptions).Find(ctx, bson.D{})
	if er != nil {
		return nil, 0, er
	}
	out := make(chan *proto.Subscription, 10000)
	go func() {
		defer close(out)
		for cursor.Next(ctx) {
			sub := &proto.Subscription{}
			if e := cursor.Decode(sub); e != nil {
				continue
			}
			out <- sub
		}
	}()
	return out, 0, nil

}

func (m *mongoimpl) purgeOneBox(ctx context.Context, logger func(string, int), ownerType proto.OwnerType, ownerId string, boxName activity.BoxName, minCount, maxCount, updatedBefore int64) error {
	filter := bson.D{
		{"owner_type", int(ownerType)},
		{"owner_id", ownerId},
		{"box_name", string(boxName)},
	}
	opts := &options.FindOptions{
		Sort:       bson.D{{"ts", -1}},
		Projection: bson.D{{"ts", 1}, {"ac_id", 1}},
	}
	c, e := m.Collection(collActivities).Find(ctx, filter, opts)
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
				ids = append(ids, p.AcId)
				continue
			}
			totalLeft++
		}
	}
	for len(ids) > 0 {
		max := 5000
		if max > len(ids) {
			max = len(ids)
		}
		sli := ids[:max]
		ids = ids[max:]
		_, e := m.Collection(collActivities).DeleteMany(ctx, bson.D{{"ac_id", bson.M{"$in": sli}}})
		if e == nil {
			logger(fmt.Sprintf("Purged %d activities for %s %s (%s)", len(sli), ownerType.String(), ownerId, boxName), len(sli))
		} else {
			return errors.Wrap(e, "purgeOne.deleteMany")
		}
	}
	return nil
}

func (m *mongoimpl) userLastMarker(ctx context.Context, userId string, boxName activity.BoxName) int64 {
	s := m.Collection(collMarkers).FindOne(ctx, bson.D{{"user_id", userId}, {"box_name", string(boxName)}})
	if s.Err() != nil {
		return 0
	}
	marker := &docMarker{}
	if er := s.Decode(marker); er != nil {
		return 0
	}
	return marker.Timestamp
}
