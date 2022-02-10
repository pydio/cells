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
	"bytes"
	"context"
	"encoding/binary"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/dustin/go-humanize"
	bolt "go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type boltdbimpl struct {
	boltdb.DAO
	InboxMaxSize int64
}

// Init the storage
func (dao *boltdbimpl) Init(options configx.Values) error {

	// Update defaut inbox max size if set in the config
	dao.InboxMaxSize = options.Val("InboxMaxSize").Default(dao.InboxMaxSize).Int64()

	dao.DB().Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(activity.OwnerType_USER.String()))
		if err != nil {
			return err
		}
		_, err = tx.CreateBucketIfNotExists([]byte(activity.OwnerType_NODE.String()))
		if err != nil {
			return err
		}
		return nil
	})

	return nil
}

// Load a given sub-bucket
// Bucket are structured like this:
// users
//   -> USER_ID
//      -> inbox [all notifications triggered by subscriptions or explicit alerts]
//      -> outbox [all user activities history]
//      -> lastread [id of the last inbox notification read]
//      -> lastsent [id of the last inbox notification sent by email, used for digest]
//      -> subscriptions [list of other users following her activities, with status]
// nodes
//   -> NODE_ID
//      -> outbox [all node activities, including its children ones]
//      -> subscriptions [list of users following this node activity]
func (dao *boltdbimpl) getBucket(tx *bolt.Tx, createIfNotExist bool, ownerType activity.OwnerType, ownerId string, bucketName BoxName) (*bolt.Bucket, error) {

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

func (dao *boltdbimpl) BatchPost(aa []*batchActivity) error {
	return dao.DB().Batch(func(tx *bolt.Tx) error {
		for _, a := range aa {
			bucket, err := dao.getBucket(tx, true, a.ownerType, a.ownerId, a.boxName)
			if err != nil {
				return err
			}
			objectKey, _ := bucket.NextSequence()
			object := a.Object
			object.Id = fmt.Sprintf("/activity-%v", objectKey)

			jsonData, _ := json.Marshal(object)

			k := make([]byte, 8)
			binary.BigEndian.PutUint64(k, objectKey)
			if err = bucket.Put(k, jsonData); err != nil {
				return err
			}
			if a.publishCtx != nil {
				broker.MustPublish(a.publishCtx, common.TopicActivityEvent, &activity.PostActivityEvent{
					OwnerType: a.ownerType,
					OwnerId:   a.ownerId,
					BoxName:   string(a.boxName),
					Activity:  object,
				})
			}
		}
		return nil
	})
}

func (dao *boltdbimpl) PostActivity(ownerType activity.OwnerType, ownerId string, boxName BoxName, object *activity.Object, publishCtx context.Context) error {

	err := dao.DB().Update(func(tx *bolt.Tx) error {

		bucket, err := dao.getBucket(tx, true, ownerType, ownerId, boxName)
		if err != nil {
			return err
		}
		objectKey, _ := bucket.NextSequence()
		object.Id = fmt.Sprintf("/activity-%v", objectKey)

		jsonData, _ := json.Marshal(object)

		k := make([]byte, 8)
		binary.BigEndian.PutUint64(k, objectKey)
		return bucket.Put(k, jsonData)

	})
	if err == nil && publishCtx != nil {
		broker.MustPublish(publishCtx, common.TopicActivityEvent, &activity.PostActivityEvent{
			OwnerType: ownerType,
			OwnerId:   ownerId,
			BoxName:   string(boxName),
			Activity:  object,
		})
	}
	return err

}

func (dao *boltdbimpl) UpdateSubscription(subscription *activity.Subscription) error {

	err := dao.DB().Update(func(tx *bolt.Tx) error {

		bucket, err := dao.getBucket(tx, true, subscription.ObjectType, subscription.ObjectId, BoxSubscriptions)
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

func (dao *boltdbimpl) ListSubscriptions(objectType activity.OwnerType, objectIds []string) (subs []*activity.Subscription, err error) {

	if len(objectIds) == 0 {
		return
	}
	userIds := make(map[string]bool)
	e := dao.DB().View(func(tx *bolt.Tx) error {

		for _, objectId := range objectIds {
			bucket, _ := dao.getBucket(tx, false, objectType, objectId, BoxSubscriptions)
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
				subs = append(subs, &activity.Subscription{
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

func (dao *boltdbimpl) ActivitiesFor(ownerType activity.OwnerType, ownerId string, boxName BoxName, refBoxOffset BoxName, reverseOffset int64, limit int64, result chan *activity.Object, done chan bool) error {

	defer func() {
		done <- true
	}()
	if boxName == "" {
		boxName = BoxOutbox
	}
	var lastRead []byte
	if limit == 0 && refBoxOffset == "" {
		limit = 20
	}

	var uintOffset uint64
	if refBoxOffset != "" {
		uintOffset = dao.ReadLastUserInbox(ownerId, refBoxOffset)
	}

	dao.DB().View(func(tx *bolt.Tx) error {
		// Assume bucket exists and has keys
		bucket, _ := dao.getBucket(tx, false, ownerType, ownerId, boxName)
		if bucket == nil {
			// Does not exists, just return
			return nil
		}
		c := bucket.Cursor()
		i := int64(0)
		total := int64(0)
		var prevObj *activity.Object
		for k, v := c.Last(); k != nil; k, v = c.Prev() {
			if uintOffset > 0 && dao.bytesToUint(k) <= uintOffset {
				break
			}
			if len(lastRead) == 0 {
				lastRead = k
			}
			if reverseOffset > 0 && i < reverseOffset {
				i++
				continue
			}
			acObject := &activity.Object{}
			err := json.Unmarshal(v, acObject)
			if prevObj != nil && dao.activitiesAreSimilar(prevObj, acObject) {
				prevObj = acObject // Ignore similar events - TODO : add occurrence number?
				continue
			}
			if err == nil {
				i++
				total++
				result <- acObject
				prevObj = acObject
			} else {
				return err
			}
			if limit > 0 && total >= limit {
				break
			}
		}
		return nil
	})

	if refBoxOffset != BoxLastSent && ownerType == activity.OwnerType_USER && boxName == BoxInbox && len(lastRead) > 0 {
		// Store last read in dedicated box
		go func() {
			dao.storeLastUserInbox(ownerId, BoxLastRead, lastRead)
		}()
	}

	return nil

}

func (dao *boltdbimpl) ReadLastUserInbox(userId string, boxName BoxName) uint64 {

	var last []byte
	dao.DB().View(func(tx *bolt.Tx) error {
		bucket, _ := dao.getBucket(tx, false, activity.OwnerType_USER, userId, boxName)
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

func (dao *boltdbimpl) StoreLastUserInbox(userId string, boxName BoxName, activityId string) error {

	id := strings.TrimPrefix(activityId, "/activity-")
	uintId, _ := strconv.ParseUint(id, 10, 64)
	last := dao.uintToBytes(uintId)

	return dao.storeLastUserInbox(userId, boxName, last)
}

// StoreLastUserInbox stores last key read to a "Last" inbox (read, sent)
func (dao *boltdbimpl) storeLastUserInbox(userId string, boxName BoxName, last []byte) error {
	return dao.DB().Update(func(tx *bolt.Tx) error {
		bucket, err := dao.getBucket(tx, true, activity.OwnerType_USER, userId, boxName)
		if err != nil {
			return err
		}
		return bucket.Put([]byte("last"), last)
	})
}

func (dao *boltdbimpl) CountUnreadForUser(userId string) int {

	var unread int
	lastRead := dao.ReadLastUserInbox(userId, BoxLastRead)

	dao.DB().View(func(tx *bolt.Tx) error {

		bucket, _ := dao.getBucket(tx, false, activity.OwnerType_USER, userId, BoxInbox)
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
func (dao *boltdbimpl) Delete(ownerType activity.OwnerType, ownerId string) error {

	err := dao.DB().Update(func(tx *bolt.Tx) error {

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

	if err != nil || ownerType != activity.OwnerType_USER {
		return err
	}

	// When clearing for a given user, clear from nodes data
	err = dao.DB().Update(func(tx *bolt.Tx) error {
		nodesBucket := tx.Bucket([]byte(activity.OwnerType_NODE.String()))
		if nodesBucket == nil {
			return nil
		}
		// Browse nodes bucket and remove activities
		nodesBucket.ForEach(func(k, v []byte) error {
			if v != nil {
				return nil
			}
			if outbox := nodesBucket.Bucket(k).Bucket([]byte(BoxOutbox)); outbox != nil {
				outbox.ForEach(func(k, v []byte) error {
					var acObject activity.Object
					if err := json.Unmarshal(v, &acObject); err == nil && acObject.Actor != nil && acObject.Actor.Id == ownerId {
						outbox.Delete(k)
					}
					return nil
				})
			}
			if subscriptions := nodesBucket.Bucket(k).Bucket([]byte(BoxSubscriptions)); subscriptions != nil {
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
func (dao *boltdbimpl) Purge(logger func(string), ownerType activity.OwnerType, ownerId string, boxName BoxName, minCount, maxCount int, updatedBefore time.Time, compactDB, clearBackup bool) error {

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
			acObject := &activity.Object{}
			if err := json.Unmarshal(v, acObject); err != nil {
				logger("Purging unknown format object")
				c.Delete()
				continue
			}
			i++
			stamp := acObject.GetUpdated()
			if (maxCount > 0 && totalLeft >= int64(maxCount)) || (!updatedBefore.IsZero() && time.Unix(stamp.Seconds, 0).Before(updatedBefore)) {
				logger(fmt.Sprintf("Purging activity %s for %s's %s", acObject.Id, owner, boxName))
				c.Delete()
				continue
			}
			totalLeft++
		}
	}

	db := dao.DB()
	e := db.Update(func(tx *bolt.Tx) error {
		if ownerId == "*" {
			mainBucket := tx.Bucket([]byte(ownerType.String()))
			mainBucket.ForEach(func(k, v []byte) error {
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
		old, newSize, er := dao.Compact(map[string]interface{}{"ClearBackup": clearBackup})
		if er == nil {
			logger(fmt.Sprintf("Successfully compacted DB, from %s to %s", humanize.Bytes(uint64(old)), humanize.Bytes(uint64(newSize))))
		}
		return er
	}
	return nil
}

// AllActivities is used for internal migrations only
func (dao *boltdbimpl) allActivities() (chan *docActivity, error) {
	db := dao.DB()
	out := make(chan *docActivity, 1000)
	listBucket := func(bb *bolt.Bucket, ownerType int32, ownerId string, boxName BoxName) {
		cursor := bb.Cursor()
		for k, v := cursor.First(); k != nil; k, v = cursor.Next() {
			acObject := &activity.Object{}
			if err := json.Unmarshal(v, acObject); err == nil {
				out <- &docActivity{
					Object:    acObject,
					BoxName:   string(boxName),
					OwnerId:   ownerId,
					OwnerType: ownerType,
				}
			}
		}
	}
	go func() {
		defer close(out)
		_ = db.View(func(tx *bolt.Tx) error {
			for typeInt, t := range activity.OwnerType_name {
				mainBucket := tx.Bucket([]byte(t))
				// Browse all user
				_ = mainBucket.ForEach(func(k, v []byte) error {
					if inbox := mainBucket.Bucket(k).Bucket([]byte(BoxInbox)); inbox != nil {
						listBucket(inbox, typeInt, string(k), BoxInbox)
					}
					if outbox := mainBucket.Bucket(k).Bucket([]byte(BoxOutbox)); outbox != nil {
						listBucket(outbox, typeInt, string(k), BoxOutbox)
					}
					return nil
				})
			}
			return nil
		})
	}()
	return out, nil
}

// AllSubscriptions is used for internal migrations only
func (dao *boltdbimpl) allSubscriptions() (chan *activity.Subscription, error) {
	out := make(chan *activity.Subscription)
	db := dao.DB()
	go func() {
		defer close(out)
		_ = db.View(func(tx *bolt.Tx) error {
			for typeInt, t := range activity.OwnerType_name {
				mainBucket := tx.Bucket([]byte(t))
				// Browse all user
				_ = mainBucket.ForEach(func(uk, uv []byte) error {
					if inbox := mainBucket.Bucket(uk).Bucket([]byte(BoxSubscriptions)); inbox != nil {
						c := inbox.Cursor()
						for k, v := c.First(); k != nil; k, v = c.Next() {
							var events []string
							if er := json.Unmarshal(v, &events); er == nil {
								out <- &activity.Subscription{
									ObjectType: activity.OwnerType(typeInt),
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
	return out, nil

}

func (dao *boltdbimpl) activitiesAreSimilar(acA *activity.Object, acB *activity.Object) bool {
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
