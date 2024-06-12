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

package bolt

import (
	"bytes"
	"context"
	"encoding/binary"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/PaesslerAG/gval"
	humanize "github.com/dustin/go-humanize"
	bolt "go.etcd.io/bbolt"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/broker/activity"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	acproto "github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/storage/boltdb"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

func init() {
	activity.Drivers.Register(NewBoltDAO)
}

func NoCacheDAO(db boltdb.DB) activity.DAO {
	return &boltdbimpl{DB: db, InboxMaxSize: 1000}
}

func ShortCacheDAO(db boltdb.DB) activity.DAO {
	return activity.WithCache(&boltdbimpl{DB: db, InboxMaxSize: 1000}, 1*time.Second)
}

func NewBoltDAO(db boltdb.DB) activity.DAO {
	d := &boltdbimpl{
		DB:           db,
		InboxMaxSize: 1000,
	}
	return activity.WithCache(d, 5*time.Second)
}

type boltdbimpl struct {
	boltdb.DB
	InboxMaxSize int64
}

// Init the storage
func (dao *boltdbimpl) Init(ctx context.Context, options configx.Values) error {

	// Update defaut inbox max size if set in the config - TODO
	// dao.InboxMaxSize = options.Val("InboxMaxSize").Default(dao.InboxMaxSize).Int64()

	return dao.DB.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(acproto.OwnerType_USER.String()))
		if err != nil {
			return err
		}
		_, err = tx.CreateBucketIfNotExists([]byte(acproto.OwnerType_NODE.String()))
		if err != nil {
			return err
		}
		return nil
	})

}

// Load a given sub-bucket
// Bucket are structured like this:
// users
//
//	-> USER_ID
//	   -> inbox [all notifications triggered by subscriptions or explicit alerts]
//	   -> outbox [all user activities history]
//	   -> lastread [id of the last inbox notification read]
//	   -> lastsent [id of the last inbox notification sent by email, used for digest]
//	   -> subscriptions [list of other users following her activities, with status]
//
// nodes
//
//	-> NODE_ID
//	   -> outbox [all node activities, including its children ones]
//	   -> subscriptions [list of users following this node activity]
func (dao *boltdbimpl) getBucket(tx *bolt.Tx, createIfNotExist bool, ownerType acproto.OwnerType, ownerId string, bucketName activity.BoxName) (*bolt.Bucket, error) {

	mainBucket := tx.Bucket([]byte(ownerType.String()))
	if createIfNotExist {

		objectBucket, err := mainBucket.CreateBucketIfNotExists([]byte(ownerId))
		if err != nil {
			return nil, err
		}
		targetBucket, err := objectBucket.CreateBucketIfNotExists([]byte(bucketName))
		if err != nil {
			return nil, err
		}
		return targetBucket, nil
	}

	objectBucket := mainBucket.Bucket([]byte(ownerId))
	if objectBucket == nil {
		return nil, nil
	}
	targetBucket := objectBucket.Bucket([]byte(bucketName))
	if targetBucket == nil {
		return nil, nil
	}
	return targetBucket, nil
}

func (dao *boltdbimpl) BatchPost(aa []*activity.BatchActivity) error {
	return dao.DB.Batch(func(tx *bolt.Tx) error {
		for _, a := range aa {
			bucket, err := dao.getBucket(tx, true, a.OwnerType, a.OwnerId, a.BoxName)
			if err != nil {
				return err
			}
			objectKey, _ := bucket.NextSequence()
			object := a.Object
			object.Id = fmt.Sprintf("/activity-%v", objectKey)

			protoData, _ := proto.Marshal(object)

			k := make([]byte, 8)
			binary.BigEndian.PutUint64(k, objectKey)
			if err = bucket.Put(k, protoData); err != nil {
				return err
			}
			if a.PublishCtx != nil {
				broker.MustPublish(a.PublishCtx, common.TopicActivityEvent, &acproto.PostActivityEvent{
					OwnerType: a.OwnerType,
					OwnerId:   a.OwnerId,
					BoxName:   string(a.BoxName),
					Activity:  object,
				})
			}
		}
		return nil
	})
}

func (dao *boltdbimpl) PostActivity(ctx context.Context, ownerType acproto.OwnerType, ownerId string, boxName activity.BoxName, object *acproto.Object, publish bool) error {

	err := dao.DB.Update(func(tx *bolt.Tx) error {

		bucket, err := dao.getBucket(tx, true, ownerType, ownerId, boxName)
		if err != nil {
			return err
		}
		objectKey, _ := bucket.NextSequence()
		object.Id = fmt.Sprintf("/activity-%v", objectKey)

		protoData, _ := proto.Marshal(object)

		k := make([]byte, 8)
		binary.BigEndian.PutUint64(k, objectKey)
		return bucket.Put(k, protoData)

	})
	if err == nil && publish {
		broker.MustPublish(ctx, common.TopicActivityEvent, &acproto.PostActivityEvent{
			OwnerType: ownerType,
			OwnerId:   ownerId,
			BoxName:   string(boxName),
			Activity:  object,
		})
	}
	return err

}

func (dao *boltdbimpl) UpdateSubscription(ctx context.Context, subscription *acproto.Subscription) error {

	err := dao.DB.Update(func(tx *bolt.Tx) error {

		bucket, err := dao.getBucket(tx, true, subscription.ObjectType, subscription.ObjectId, activity.BoxSubscriptions)
		if err != nil {
			return err
		}

		events := subscription.Events
		if len(events) == 0 {
			return bucket.Delete([]byte(subscription.UserId))
		}

		eventsData, _ := json.Marshal(events)
		return bucket.Put([]byte(subscription.UserId), eventsData)
	})
	return err
}

func (dao *boltdbimpl) ListSubscriptions(ctx context.Context, objectType acproto.OwnerType, objectIds []string) (subs []*acproto.Subscription, err error) {

	if len(objectIds) == 0 {
		return
	}
	userIds := make(map[string]bool)
	e := dao.DB.View(func(tx *bolt.Tx) error {

		for _, objectId := range objectIds {
			bucket, _ := dao.getBucket(tx, false, objectType, objectId, activity.BoxSubscriptions)
			if bucket == nil {
				continue
			}
			er := bucket.ForEach(func(k, v []byte) error {
				uId := string(k)
				if _, exists := userIds[uId]; exists {
					return nil // Already listed
				}
				var events []string
				uE := json.Unmarshal(v, &events)
				if uE != nil {
					return uE
				}
				subs = append(subs, &acproto.Subscription{
					UserId:     uId,
					Events:     events,
					ObjectType: objectType,
					ObjectId:   objectId,
				})
				userIds[uId] = true
				return nil
			})
			if er != nil {
				// Oops, something went wrong here!
			}
		}

		return nil
	})

	return subs, e
}

func (dao *boltdbimpl) ActivitiesFor(ctx context.Context, ownerType acproto.OwnerType, ownerId string, boxName activity.BoxName, refBoxOffset activity.BoxName, reverseOffset int64, limit int64, streamFilter string, result chan *acproto.Object, done chan bool) error {

	defer func() {
		done <- true
	}()
	if boxName == "" {
		boxName = activity.BoxOutbox
	}
	var lastRead []byte
	if limit == 0 && refBoxOffset == "" {
		limit = 20
	}

	var uintOffset uint64
	if refBoxOffset != "" {
		uintOffset = dao.ReadLastUserInbox(ownerId, refBoxOffset)
	}
	var evaluable gval.Evaluable
	if streamFilter != "" {
		var err error
		var fieldErs []error
		evaluable, _, err = boltdb.BleveQueryToJSONPath(streamFilter, "$", true, func(s string) string {
			var fe error
			if s, fe = activity.QueryFieldsTransformer(s); fe != nil {
				fieldErs = append(fieldErs, fe)
			}
			if s == "updated" {
				s = "updatedTS"
			}
			return s
		}, true)
		if len(fieldErs) > 0 {
			return fieldErs[0]
		}
		if err != nil {
			return err
		}
	}

	viewErr := dao.DB.View(func(tx *bolt.Tx) error {
		// Assume bucket exists and has keys
		bucket, _ := dao.getBucket(tx, false, ownerType, ownerId, boxName)
		if bucket == nil {
			// Does not exists, just return
			return nil
		}
		c := bucket.Cursor()
		i := int64(0)
		total := int64(0)
		stackCount := int32(1)
		var prevObj *acproto.Object
		for k, v := c.Last(); k != nil; k, v = c.Prev() {
			if uintOffset > 0 && dao.bytesToUint(k) <= uintOffset {
				break
			}
			if len(lastRead) == 0 {
				lastRead = k
			}
			acObject, err := dao.UnmarshalActivity(v)
			if err != nil {
				return err
			}
			if evaluable != nil {
				// Unmarshal as map[string]interface{} for evaluation
				var search map[string]interface{}
				bb, _ := json.Marshal(acObject)
				_ = json.Unmarshal(bb, &search)
				if acObject.Updated != nil {
					search["updatedTS"] = acObject.Updated.GetSeconds()
				}
				if match, er := evaluable.EvalInt(ctx, []interface{}{search}); er != nil {
					return er
				} else if match == 0 {
					continue
				}
			}
			// Ignore similar events. In that case increment occurrence number as TotalItems field
			if prevObj != nil && dao.activitiesAreSimilar(prevObj, acObject) {
				prevObj = acObject
				stackCount++
				continue
			}
			if stackCount > 1 {
				acObject.TotalItems = stackCount
			}
			prevObj = acObject
			// Reset
			stackCount = 1
			if reverseOffset > 0 && i < reverseOffset {
				i++
				continue
			}
			i++
			total++
			result <- acObject
			if limit > 0 && total >= limit {
				break
			}
		}
		return nil
	})

	if refBoxOffset != activity.BoxLastSent && ownerType == acproto.OwnerType_USER && boxName == activity.BoxInbox && len(lastRead) > 0 {
		// Store last read in dedicated box
		go func() {
			_ = dao.storeLastUserInbox(ownerId, activity.BoxLastRead, lastRead)
		}()
	}

	return viewErr

}

func (dao *boltdbimpl) ReadLastUserInbox(userId string, boxName activity.BoxName) uint64 {

	var last []byte
	dao.DB.View(func(tx *bolt.Tx) error {
		bucket, _ := dao.getBucket(tx, false, acproto.OwnerType_USER, userId, boxName)
		if bucket == nil {
			return nil
		}
		last = bucket.Get([]byte("last"))
		return nil
	})
	if len(last) > 0 {
		return dao.bytesToUint(last)
	}
	return 0
}

func (dao *boltdbimpl) StoreLastUserInbox(ctx context.Context, userId string, boxName activity.BoxName, activityId string) error {

	id := strings.TrimPrefix(activityId, "/activity-")
	uintId, _ := strconv.ParseUint(id, 10, 64)
	last := dao.uintToBytes(uintId)

	return dao.storeLastUserInbox(userId, boxName, last)
}

// StoreLastUserInbox stores last key read to a "Last" inbox (read, sent)
func (dao *boltdbimpl) storeLastUserInbox(userId string, boxName activity.BoxName, last []byte) error {
	return dao.DB.Update(func(tx *bolt.Tx) error {
		bucket, err := dao.getBucket(tx, true, acproto.OwnerType_USER, userId, boxName)
		if err != nil {
			return err
		}
		return bucket.Put([]byte("last"), last)
	})
}

func (dao *boltdbimpl) CountUnreadForUser(ctx context.Context, userId string) int {

	var unread int
	lastRead := dao.ReadLastUserInbox(userId, activity.BoxLastRead)

	dao.DB.View(func(tx *bolt.Tx) error {

		bucket, _ := dao.getBucket(tx, false, acproto.OwnerType_USER, userId, activity.BoxInbox)
		if bucket != nil {
			c := bucket.Cursor()
			for k, _ := c.Last(); k != nil; k, _ = c.Prev() {
				kUint := dao.bytesToUint(k)
				if kUint <= lastRead {
					break
				}
				unread++
			}
		}
		return nil
	})

	return unread
}

// Delete should be wired to "USER_DELETE" and "NODE_DELETE" events
// to remove (or archive?) deprecated queues
func (dao *boltdbimpl) Delete(ctx context.Context, ownerType acproto.OwnerType, ownerId string) error {

	err := dao.DB.Update(func(tx *bolt.Tx) error {

		b := tx.Bucket([]byte(ownerType.String()))
		if b == nil {
			return nil
		}
		idBucket := b.Bucket([]byte(ownerId))
		if idBucket == nil {
			return nil
		}
		return b.DeleteBucket([]byte(ownerId))

	})

	if err != nil || ownerType != acproto.OwnerType_USER {
		return err
	}

	// When clearing for a given user, clear from nodes data
	err = dao.DB.Update(func(tx *bolt.Tx) error {
		nodesBucket := tx.Bucket([]byte(acproto.OwnerType_NODE.String()))
		if nodesBucket == nil {
			return nil
		}
		// Browse nodes bucket and remove activities
		nodesBucket.ForEach(func(k, v []byte) error {
			if v != nil {
				return nil
			}
			if outbox := nodesBucket.Bucket(k).Bucket([]byte(activity.BoxOutbox)); outbox != nil {
				outbox.ForEach(func(k, v []byte) error {
					acObject, er := dao.UnmarshalActivity(v)
					if er == nil && acObject.Actor != nil && acObject.Actor.Id == ownerId {
						_ = outbox.Delete(k)
					}
					return nil
				})
			}
			if subscriptions := nodesBucket.Bucket(k).Bucket([]byte(activity.BoxSubscriptions)); subscriptions != nil {
				subscriptions.ForEach(func(k, v []byte) error {
					if string(k) == ownerId {
						subscriptions.Delete(k)
					}
					return nil
				})
			}
			return nil
		})
		return nil
	})

	return err
}

// Purge removes records based on a maximum number of records and/or based on the activity update date
// It keeps at least minCount record(s) - to see last activity - even if older than expected date
// Warning, dao must be resolved again after calling this function if compact is set
func (dao *boltdbimpl) Purge(ctx context.Context, logger func(string, int), ownerType acproto.OwnerType, ownerId string, boxName activity.BoxName, minCount, maxCount int, updatedBefore time.Time, compactDB, clearBackup bool) error {

	purgeBucket := func(bucket *bolt.Bucket, owner string) {
		c := bucket.Cursor()
		i := int64(0)
		totalLeft := int64(0)

		for k, v := c.Last(); k != nil; k, v = c.Prev() {
			if minCount > 0 && i < int64(minCount) {
				i++
				totalLeft++
				continue
			}

			acObject, err := dao.UnmarshalActivity(v)
			if err != nil {
				logger("Purging unknown format object", 1)
				_ = c.Delete()
				continue
			}
			i++
			stamp := acObject.GetUpdated()
			if (maxCount > 0 && totalLeft >= int64(maxCount)) || (!updatedBefore.IsZero() && time.Unix(stamp.Seconds, 0).Before(updatedBefore)) {
				logger(fmt.Sprintf("Purging activity %s for %s's %s", acObject.Id, owner, boxName), 1)
				_ = c.Delete()
				continue
			}
			totalLeft++
		}
	}

	e := dao.DB.Update(func(tx *bolt.Tx) error {
		if ownerId == "*" {
			mainBucket := tx.Bucket([]byte(ownerType.String()))
			_ = mainBucket.ForEach(func(k, v []byte) error {
				b := mainBucket.Bucket(k).Bucket([]byte(boxName))
				if b != nil {
					purgeBucket(b, string(k))
				}
				return nil
			})
		} else if bucket, _ := dao.getBucket(tx, false, ownerType, ownerId, boxName); bucket != nil {
			purgeBucket(bucket, ownerId)
		}
		return nil
	})
	if e != nil {
		return e
	}

	if compactDB {
		old, newSize, er := dao.Compact(ctx, map[string]interface{}{"ClearBackup": clearBackup})
		if er == nil {
			logger(fmt.Sprintf("Successfully compacted DB, from %s to %s", humanize.Bytes(old), humanize.Bytes(newSize)), 0)
		}
		return er
	}

	return nil
}

// AllActivities is used for internal migrations only
func (dao *boltdbimpl) AllActivities(ctx context.Context) (chan *activity.BatchActivity, int, error) {

	db := dao.DB
	out := make(chan *activity.BatchActivity, 1000)
	listBucket := func(bb *bolt.Bucket, ownerType int32, ownerId string, boxName activity.BoxName) {
		cursor := bb.Cursor()
		for k, v := cursor.First(); k != nil; k, v = cursor.Next() {
			acObject, err := dao.UnmarshalActivity(v)
			if err == nil {
				out <- &activity.BatchActivity{
					Object:    acObject,
					BoxName:   boxName,
					OwnerId:   ownerId,
					OwnerType: acproto.OwnerType(ownerType),
				}
			}
		}
	}
	var total int
	_ = db.View(func(tx *bolt.Tx) error {
		// First compute total
		for _, t := range acproto.OwnerType_name {
			mainBucket := tx.Bucket([]byte(t))
			// Browse all user
			_ = mainBucket.ForEach(func(k, v []byte) error {
				if inbox := mainBucket.Bucket(k).Bucket([]byte(activity.BoxInbox)); inbox != nil {
					total += inbox.Stats().KeyN
				}
				if outbox := mainBucket.Bucket(k).Bucket([]byte(activity.BoxOutbox)); outbox != nil {
					total += outbox.Stats().KeyN
				}
				return nil
			})
		}
		return nil
	})

	go func() {
		defer close(out)
		_ = db.View(func(tx *bolt.Tx) error {
			for typeInt, t := range acproto.OwnerType_name {
				mainBucket := tx.Bucket([]byte(t))
				// Browse all user
				_ = mainBucket.ForEach(func(k, v []byte) error {
					if inbox := mainBucket.Bucket(k).Bucket([]byte(activity.BoxInbox)); inbox != nil {
						listBucket(inbox, typeInt, string(k), activity.BoxInbox)
					}
					if outbox := mainBucket.Bucket(k).Bucket([]byte(activity.BoxOutbox)); outbox != nil {
						listBucket(outbox, typeInt, string(k), activity.BoxOutbox)
					}
					return nil
				})
			}
			return nil
		})
	}()
	return out, total, nil
}

// AllSubscriptions is used for internal migrations only
func (dao *boltdbimpl) AllSubscriptions(ctx context.Context) (chan *acproto.Subscription, int, error) {
	out := make(chan *acproto.Subscription)
	var total int
	_ = dao.DB.View(func(tx *bolt.Tx) error {
		for _, t := range acproto.OwnerType_name {
			mainBucket := tx.Bucket([]byte(t))
			// Browse all user
			_ = mainBucket.ForEach(func(uk, uv []byte) error {
				if inbox := mainBucket.Bucket(uk).Bucket([]byte(activity.BoxSubscriptions)); inbox != nil {
					total += inbox.Stats().KeyN
				}
				return nil
			})
		}
		return nil
	})
	go func() {
		defer close(out)
		_ = dao.DB.View(func(tx *bolt.Tx) error {
			for typeInt, t := range acproto.OwnerType_name {
				mainBucket := tx.Bucket([]byte(t))
				// Browse all user
				_ = mainBucket.ForEach(func(uk, uv []byte) error {
					if inbox := mainBucket.Bucket(uk).Bucket([]byte(activity.BoxSubscriptions)); inbox != nil {
						c := inbox.Cursor()
						for k, v := c.First(); k != nil; k, v = c.Next() {
							var events []string
							if er := json.Unmarshal(v, &events); er == nil {
								out <- &acproto.Subscription{
									ObjectType: acproto.OwnerType(typeInt),
									UserId:     string(uk),
									ObjectId:   string(k),
									Events:     events,
								}
							} else {
								fmt.Println(er.Error())
							}
						}
					}
					return nil
				})
			}
			return nil
		})
	}()
	return out, total, nil

}

func (dao *boltdbimpl) activitiesAreSimilar(acA *acproto.Object, acB *acproto.Object) bool {
	if acA.Actor == nil || acA.Object == nil || acB.Actor == nil || acB.Object == nil {
		return false
	}
	return acA.Type == acB.Type && acA.Actor.Id == acB.Actor.Id && acA.Object.Id == acB.Object.Id
}

// Transform an uint64 to a storable []byte array
func (dao *boltdbimpl) uintToBytes(i uint64) []byte {
	k := make([]byte, 8)
	binary.BigEndian.PutUint64(k, i)
	return k
}

// Transform stored []byte to an uint64
func (dao *boltdbimpl) bytesToUint(by []byte) uint64 {
	var num uint64
	binary.Read(bytes.NewBuffer(by[:]), binary.BigEndian, &num)
	return num
}

func (dao *boltdbimpl) UnmarshalActivity(bb []byte) (*acproto.Object, error) {
	acObject := &acproto.Object{}
	// try proto first
	if err := proto.Unmarshal(bb, acObject); err == nil {
		return acObject, err
	}
	// otherwise try JSON
	err := json.Unmarshal(bb, acObject)
	return acObject, err
}
