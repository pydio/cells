/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"log"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/golang/protobuf/ptypes/timestamp"

	"github.com/pborman/uuid"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/boltdb"
	"github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/x/configx"
)

var (
	tmpDbFilePath string
	conf          configx.Values
)

func init() {
	// Define parameters to shorten tests launch
	tmpDbFilePath = os.TempDir() + "/bolt-test.db"
	conf = configx.New()
	conf.Val("InboxMaxSize").Set(int64(10))
}

func TestEmptyDao(t *testing.T) {

	Convey("Test initialize DB", t, func() {
		defer os.Remove(tmpDbFilePath)
		dao := boltdb.NewDAO("boltdb", tmpDbFilePath, "")
		So(dao, ShouldNotBeNil)
		defer dao.CloseConn()
	})

	Convey("Test unreachable file", t, func() {
		dbFile := os.TempDir() + "/anynonexisting/folder/toto.db"
		dao := boltdb.NewDAO("boltdb", dbFile, "")
		So(dao, ShouldBeNil)
	})

	Convey("Test getBucket - read - not exists", t, func() {
		defer os.Remove(tmpDbFilePath)
		tmpdao := boltdb.NewDAO("boltdb", tmpDbFilePath, "")
		dao := NewDAO(tmpdao).(*boltdbimpl)
		dao.Init(conf)
		defer dao.CloseConn()

		results := make(chan *activity.Object)
		done := make(chan bool, 1)
		err := dao.ActivitiesFor(activity.OwnerType_USER, "unknown", BoxInbox, BoxLastRead, 0, 100, results, done)
		So(err, ShouldBeNil)
	})
}

func TestInsertActivity(t *testing.T) {

	defer os.Remove(tmpDbFilePath)
	tmpdao := boltdb.NewDAO("boltdb", tmpDbFilePath, "")
	dao := NewDAO(tmpdao).(*boltdbimpl)
	dao.Init(conf)
	defer dao.CloseConn()

	Convey("Test insert", t, func() {

		ac := &activity.Object{
			Type: activity.ObjectType_Travel,
			Actor: &activity.Object{
				Type: activity.ObjectType_Person,
				Name: "John Doe",
				Id:   "john",
			},
		}

		err := dao.PostActivity(activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, ac)
		So(err, ShouldBeNil)

		results := []*activity.Object{}
		resChan := make(chan *activity.Object)
		doneChan := make(chan bool)

		wg := &sync.WaitGroup{}
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case act := <-resChan:
					if act != nil {
						results = append(results, act)
					}
				case <-doneChan:
					return
				}
			}
		}()

		err = dao.ActivitiesFor(activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, "", 0, 100, resChan, doneChan)
		wg.Wait()

		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 1)
		So(results[0], ShouldResemble, ac)
	})

	Convey("Test Unread box", t, func() {

		ac := &activity.Object{
			Type: activity.ObjectType_Travel,
			Actor: &activity.Object{
				Type: activity.ObjectType_Person,
				Name: "John Doe",
				Id:   "john",
			},
		}

		err := dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac)
		So(err, ShouldBeNil)

		unread := dao.CountUnreadForUser("john")
		So(unread, ShouldEqual, 1)

		resChan := make(chan *activity.Object)
		doneChan := make(chan bool, 1)
		//dao.ActivitiesFor(activity.OwnerType_USER, "john", BoxInbox, results, done)

		wg := &sync.WaitGroup{}
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case act := <-resChan:
					if act != nil {
						log.Println(act)
					}
				case <-doneChan:
					return
				}
			}
		}()

		err = dao.ActivitiesFor(activity.OwnerType_USER, "john", BoxInbox, "", 0, 100, resChan, doneChan)
		wg.Wait()

		time.Sleep(time.Second * 1)
		So(err, ShouldBeNil)
		unread = dao.CountUnreadForUser("john")
		So(unread, ShouldEqual, 0)
	})
}

func TestMultipleInsert(t *testing.T) {

	defer os.Remove(tmpDbFilePath)
	tmpdao := boltdb.NewDAO("boltdb", tmpDbFilePath, "")
	dao := NewDAO(tmpdao).(*boltdbimpl)
	dao.Init(conf)
	defer dao.CloseConn()

	Convey("Test insert", t, func() {

		ac := &activity.Object{
			Type: activity.ObjectType_Travel,
			Actor: &activity.Object{
				Type: activity.ObjectType_Person,
				Name: "Charles du Jeu",
				Id:   "charles",
			},
		}

		err := dao.PostActivity(activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, ac)
		err = dao.PostActivity(activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, ac)
		err = dao.PostActivity(activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, ac)
		So(err, ShouldBeNil)

		results := []*activity.Object{}
		resChan := make(chan *activity.Object)
		doneChan := make(chan bool)

		wg := &sync.WaitGroup{}
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case act := <-resChan:
					if act != nil {
						results = append(results, act)
					}
				case <-doneChan:
					return
				}
			}
		}()

		err = dao.ActivitiesFor(activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, "", 0, 100, resChan, doneChan)
		wg.Wait()

		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 3)
		So(results[0], ShouldResemble, ac)

	})
}

func TestCursor(t *testing.T) {

	defer os.Remove(tmpDbFilePath)
	tmpdao := boltdb.NewDAO("boltdb", tmpDbFilePath, "")
	dao := NewDAO(tmpdao).(*boltdbimpl)
	dao.Init(conf)
	defer dao.CloseConn()

	Convey("Insert Activities and browse", t, func() {

		for i := 0; i < 50; i++ {
			ac := &activity.Object{
				Type: activity.ObjectType_Accept,
				Actor: &activity.Object{
					Type: activity.ObjectType_Person,
					Name: "Random User",
					Id:   uuid.NewUUID().String(),
				},
			}
			err := dao.PostActivity(activity.OwnerType_USER, "charles", BoxInbox, ac)
			So(err, ShouldBeNil)
		}

		results := []*activity.Object{}
		resChan := make(chan *activity.Object)
		doneChan := make(chan bool)

		readResults := func(waiter *sync.WaitGroup) {
			defer waiter.Done()
			for {
				select {
				case act := <-resChan:
					if act != nil {
						results = append(results, act)
					}
				case <-doneChan:
					return
				}
			}
		}

		wg := &sync.WaitGroup{}
		wg.Add(1)
		go func() {
			readResults(wg)
		}()
		err := dao.ActivitiesFor(activity.OwnerType_USER, "charles", BoxInbox, "", 0, 20, resChan, doneChan)
		wg.Wait()
		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 20)

		results = results[:0]
		wg.Add(1)
		go func() {
			readResults(wg)
		}()
		err = dao.ActivitiesFor(activity.OwnerType_USER, "charles", BoxInbox, "", 20, 20, resChan, doneChan)
		wg.Wait()
		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 20)
		So(results[0].Id, ShouldEqual, "/activity-30")
		So(results[19].Id, ShouldEqual, "/activity-11")

		results = results[:0]
		wg.Add(1)
		go func() {
			readResults(wg)
		}()
		err = dao.ActivitiesFor(activity.OwnerType_USER, "charles", BoxInbox, "", 20, 100, resChan, doneChan)
		wg.Wait()
		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 30)
		So(results[0].Id, ShouldEqual, "/activity-30")
		So(results[29].Id, ShouldEqual, "/activity-1")

		// GET LAST NOT SENT YET
		results = results[:0]
		wg.Add(1)
		go func() {
			readResults(wg)
		}()
		err = dao.ActivitiesFor(activity.OwnerType_USER, "charles", BoxInbox, BoxLastSent, 0, 0, resChan, doneChan)
		wg.Wait()
		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 50)
		So(results[0].Id, ShouldEqual, "/activity-50")
		err = dao.StoreLastUserInbox("charles", BoxLastSent, nil, results[0].Id)
		So(err, ShouldBeNil)

		// STORE 20 NEW ONES
		for i := 0; i < 20; i++ {
			ac := &activity.Object{
				Type: activity.ObjectType_Accept,
				Actor: &activity.Object{
					Type: activity.ObjectType_Person,
					Name: "Random User",
					Id:   uuid.NewUUID().String(),
				},
			}
			err := dao.PostActivity(activity.OwnerType_USER, "charles", BoxInbox, ac)
			So(err, ShouldBeNil)
		}

		// NOW CHECK IF WE DO HAVE ONLY 20 RESULTS
		results = results[:0]
		wg.Add(1)
		go func() {
			readResults(wg)
		}()
		err = dao.ActivitiesFor(activity.OwnerType_USER, "charles", BoxInbox, BoxLastSent, 0, 0, resChan, doneChan)
		wg.Wait()
		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 20)
		So(results[0].Id, ShouldEqual, "/activity-70")
		So(results[19].Id, ShouldEqual, "/activity-51")

	})
}

func TestDelete(t *testing.T) {

	defer os.Remove(tmpDbFilePath)
	tmpdao := boltdb.NewDAO("boltdb", tmpDbFilePath, "")
	dao := NewDAO(tmpdao).(*boltdbimpl)
	dao.Init(conf)
	defer dao.CloseConn()

	Convey("Test Delete Owner", t, func() {

		ac := &activity.Object{
			Type: activity.ObjectType_Travel,
			Actor: &activity.Object{
				Type: activity.ObjectType_Person,
				Name: "John Doe",
				Id:   "john",
			},
		}

		err := dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac)
		So(err, ShouldBeNil)

		err = dao.Delete(activity.OwnerType_USER, "john")
		So(err, ShouldBeNil)

		err = dao.Delete(activity.OwnerType_USER, "unknown")
		So(err, ShouldBeNil)

	})
}

func TestPurge(t *testing.T) {

	defer os.Remove(tmpDbFilePath)
	tmpdao := boltdb.NewDAO("boltdb", tmpDbFilePath, "")
	dao := NewDAO(tmpdao).(*boltdbimpl)
	dao.Init(conf)
	defer dao.CloseConn()

	listJohn := func() ([]*activity.Object, error) {
		var results []*activity.Object
		resChan := make(chan *activity.Object)
		doneChan := make(chan bool)
		readResults := func(waiter *sync.WaitGroup) {
			defer waiter.Done()
			for {
				select {
				case act := <-resChan:
					if act != nil {
						results = append(results, act)
					}
				case <-doneChan:
					return
				}
			}
		}
		wg := &sync.WaitGroup{}
		wg.Add(1)
		go func() {
			readResults(wg)
		}()
		err := dao.ActivitiesFor(activity.OwnerType_USER, "john", BoxInbox, "", 0, 20, resChan, doneChan)
		wg.Wait()
		return results, err
	}

	Convey("Test Purge Activities", t, func() {
		logger := func(s string) {
			t.Log(s)
		}
		threeDays := 3 * time.Hour * 24
		ac1 := &activity.Object{Type: activity.ObjectType_Like, Updated: &timestamp.Timestamp{Seconds: time.Now().Add(-threeDays).Unix()}}
		ac2 := &activity.Object{Type: activity.ObjectType_Accept, Updated: &timestamp.Timestamp{Seconds: time.Now().Add(-threeDays).Add(-threeDays).Unix()}}
		ac3 := &activity.Object{Type: activity.ObjectType_Share, Updated: &timestamp.Timestamp{Seconds: time.Now().Add(-threeDays).Add(-threeDays).Add(-threeDays).Unix()}}
		ac4 := &activity.Object{Type: activity.ObjectType_Share, Updated: &timestamp.Timestamp{Seconds: time.Now().Add(-threeDays).Add(-threeDays).Add(-threeDays).Add(-threeDays).Unix()}}
		err := dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac1)
		So(err, ShouldBeNil)
		dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac2)
		dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac3)
		dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac4)

		err = dao.Purge(logger, activity.OwnerType_USER, "john", BoxInbox, 1, 100, time.Time{})
		So(err, ShouldBeNil)

		results, err := listJohn()
		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 4)

		err = dao.Purge(logger, activity.OwnerType_USER, "john", BoxInbox, 1, 2, time.Time{})
		So(err, ShouldBeNil)

		results, err = listJohn()
		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 2)

		// Now test purge by date
		dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac2)
		dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac3)
		dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac4)
		sevenDays := 7 * time.Hour * 24
		err = dao.Purge(logger, activity.OwnerType_USER, "john", BoxInbox, 1, 100, time.Now().Add(-sevenDays))
		So(err, ShouldBeNil)
		results, err = listJohn()
		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 2)

		// Purge by date all users - re-add ac3, ac4 removed in previous step
		dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac3)
		dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac4)
		err = dao.Purge(logger, activity.OwnerType_USER, "*", BoxInbox, 1, 100, time.Now().Add(-sevenDays))
		So(err, ShouldBeNil)
		results, err = listJohn()
		So(err, ShouldBeNil)
		So(results, ShouldHaveLength, 2)

	})
}

func TestSubscriptions(t *testing.T) {

	defer os.Remove(tmpDbFilePath)
	tmpdao := boltdb.NewDAO("boltdb", tmpDbFilePath, "")
	dao := NewDAO(tmpdao).(*boltdbimpl)
	dao.Init(conf)
	defer dao.CloseConn()

	Convey("Test subscribe", t, func() {

		sub := &activity.Subscription{
			UserId:     "user1",
			ObjectType: activity.OwnerType_NODE,
			ObjectId:   "ROOT",
			Events:     []string{"read", "write"},
		}
		err := dao.UpdateSubscription(sub)
		So(err, ShouldBeNil)

		subs, err := dao.ListSubscriptions(activity.OwnerType_NODE, []string{"ROOT"})
		So(err, ShouldBeNil)
		So(subs, ShouldHaveLength, 1)

		So(subs[0].Events, ShouldHaveLength, 2)
		So(subs[0].UserId, ShouldEqual, "user1")

	})

	Convey("Test unsubscribe", t, func() {

		sub := &activity.Subscription{
			UserId:     "user1",
			ObjectType: activity.OwnerType_NODE,
			ObjectId:   "ROOT",
			Events:     []string{},
		}

		err := dao.UpdateSubscription(sub)
		So(err, ShouldBeNil)

		subs, err := dao.ListSubscriptions(activity.OwnerType_NODE, []string{"ROOT"})
		So(err, ShouldBeNil)
		So(subs, ShouldHaveLength, 0)

	})
}
