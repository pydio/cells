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
	"log"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"testing"
	"time"

	humanize "github.com/dustin/go-humanize"
	"google.golang.org/protobuf/types/known/timestamppb"

	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/boltdb"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/test"
	"github.com/pydio/cells/v4/common/utils/uuid"

	_ "github.com/pydio/cells/v4/common/storage/boltdb"
	_ "github.com/pydio/cells/v4/common/storage/mongodb"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	conf configx.Values
	ctx  = context.Background()
)

func testCases() []test.StorageTestCase {
	return []test.StorageTestCase{
		{[]string{"boltdb://" + filepath.Join(os.TempDir(), "activity_bolt_"+uuid.New()+".db")}, true, NoCacheDAO},
		{[]string{"boltdb://" + filepath.Join(os.TempDir(), "activity_bolt_"+uuid.New()+".db")}, true, ShortCacheDAO},
		test.TemplateMongoEnvWithPrefix(NewMongoDAO, "unit_broker_"),
	}
}

func boltCases() []test.StorageTestCase {
	return []test.StorageTestCase{
		{[]string{"boltdb://" + filepath.Join(os.TempDir(), "activity_bolt_"+uuid.New()+".db")}, true, NoCacheDAO},
	}
}

func init() {
	conf = configx.New()
	conf.Val("InboxMaxSize").Set(int64(10))
}

func NoCacheDAO(db *boltdb.Compacter) DAO {
	return &boltdbimpl{Compacter: db, InboxMaxSize: 1000}
}

func ShortCacheDAO(db *boltdb.Compacter) DAO {
	return WithCache(&boltdbimpl{Compacter: db, InboxMaxSize: 1000}, 1*time.Second)
}

func waitIfCache(d DAO) {
	if _, o := d.(*Cache); o {
		<-time.After(2 * time.Second)
	}
}

func TestBasicEmptyDao(t *testing.T) {

	test.RunStorageTests(testCases(), func(ctx context.Context) {
		Convey("Test getBucket - read - not exists", t, func() {
			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			results := make(chan *activity.Object)
			done := make(chan bool, 1)
			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "unknown", BoxInbox, BoxLastRead, 0, 100, "", results, done)
			So(err, ShouldBeNil)
		})
	})
}

func TestBoltMassivePurge(t *testing.T) {
	test.RunStorageTests(boltCases(), func(ctx context.Context) {
		dao, err := manager.Resolve[DAO](ctx)
		if err != nil {
			panic(err)
		}

		number := 100000
		bb := dao.(*boltdbimpl).DB

		Convey("Test Massive Purge", t, func() {
			var aa []*batchActivity
			for i := 0; i < number; i++ {
				aa = append(aa, &batchActivity{
					Object:     &activity.Object{Type: activity.ObjectType_Like, Updated: &timestamppb.Timestamp{Seconds: time.Now().Unix()}},
					ownerType:  activity.OwnerType_NODE,
					ownerId:    "node-id",
					boxName:    BoxOutbox,
					publishCtx: nil,
				})
			}
			err := dao.(batchDAO).BatchPost(aa)
			So(err, ShouldBeNil)
			st, e := os.Stat(bb.Path())
			So(e, ShouldBeNil)
			initSize := st.Size()
			t.Log("DB Size is", humanize.Bytes(uint64(initSize)))
			stats, _ := jsonx.Marshal(bb.Stats())
			t.Log(string(stats))
			So(st.Size(), ShouldBeGreaterThan, 0)

			<-time.After(5 * time.Second)
			deleted := 0
			// Now Purge
			e = dao.Purge(ctx, func(s string, i int) { deleted += i }, activity.OwnerType_NODE, "node-id", BoxOutbox, 0, 10, time.Time{}, true, true)
			So(e, ShouldBeNil)
			So(deleted, ShouldBeGreaterThan, 1)

			// Resolve DAO Again
			dao2, err2 := manager.Resolve[DAO](ctx)
			if err2 != nil {
				panic(err2)
			}
			bb2 := dao2.(*boltdbimpl).DB

			st, _ = os.Stat(bb2.Path())
			newSize := st.Size()
			t.Log("DB Size is now", humanize.Bytes(uint64(newSize)), "after", deleted, "deletes and compaction")
			stats, _ = jsonx.Marshal(bb2.Stats())
			t.Log(string(stats))
			So(newSize, ShouldBeLessThan, initSize)

		})
	})
}

func TestInsertActivity(t *testing.T) {

	test.RunStorageTests(testCases(), func(ctx context.Context) {

		Convey("Test insert", t, func() {

			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			ac := &activity.Object{
				Type: activity.ObjectType_Travel,
				Actor: &activity.Object{
					Type: activity.ObjectType_Person,
					Name: "John Doe",
					Id:   "john",
				},
			}

			err = dao.PostActivity(ctx, activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, ac, false)
			So(err, ShouldBeNil)
			waitIfCache(dao)

			var results []*activity.Object
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

			err = dao.ActivitiesFor(ctx, activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, "", 0, 100, "", resChan, doneChan)
			wg.Wait()

			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
			So(results[0].Actor.Id, ShouldEqual, "john")
		})

		Convey("Test Unread box", t, func() {

			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			ac := &activity.Object{
				Type: activity.ObjectType_Travel,
				Actor: &activity.Object{
					Type: activity.ObjectType_Person,
					Name: "John Doe",
					Id:   "john",
				},
			}

			err = dao.PostActivity(ctx, activity.OwnerType_USER, "john", BoxInbox, ac, false)
			So(err, ShouldBeNil)
			waitIfCache(dao)

			unread := dao.CountUnreadForUser(nil, "john")
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

			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "john", BoxInbox, "", 0, 100, "", resChan, doneChan)
			wg.Wait()

			time.Sleep(time.Second * 1)
			So(err, ShouldBeNil)
			unread = dao.CountUnreadForUser(nil, "john")
			So(unread, ShouldEqual, 0)
		})
	})
}

func TestMultipleInsert(t *testing.T) {

	test.RunStorageTests(testCases(), func(ctx context.Context) {

		Convey("Test insert", t, func() {
			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			ac := &activity.Object{
				Type: activity.ObjectType_Travel,
				Actor: &activity.Object{
					Type: activity.ObjectType_Person,
					Name: "Charles du Jeu",
					Id:   "charles",
				},
			}

			err = dao.PostActivity(ctx, activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, ac, false)
			So(err, ShouldBeNil)
			err = dao.PostActivity(ctx, activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, ac, false)
			So(err, ShouldBeNil)
			err = dao.PostActivity(ctx, activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, ac, false)
			So(err, ShouldBeNil)

			waitIfCache(dao)

			var results []*activity.Object
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

			err = dao.ActivitiesFor(ctx, activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, "", 0, 100, "", resChan, doneChan)
			wg.Wait()

			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 3)
			So(results[0].Actor.Name, ShouldEqual, "Charles du Jeu")

		})
	})
}

func TestCursor(t *testing.T) {

	test.RunStorageTests(testCases(), func(ctx context.Context) {
		Convey("Insert Activities and browse", t, func() {
			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			for i := 0; i < 50; i++ {
				ac := &activity.Object{
					Type: activity.ObjectType_Accept,
					Actor: &activity.Object{
						Type: activity.ObjectType_Person,
						Name: fmt.Sprintf("Random User %d", i+1),
						Id:   uuid.New(),
					},
				}
				err := dao.PostActivity(ctx, activity.OwnerType_USER, "charles", BoxInbox, ac, false)
				So(err, ShouldBeNil)
			}

			waitIfCache(dao)
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
			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "charles", BoxInbox, "", 0, 20, "", resChan, doneChan)
			wg.Wait()
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 20)

			results = results[:0]
			wg.Add(1)
			go func() {
				readResults(wg)
			}()
			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "charles", BoxInbox, "", 20, 20, "", resChan, doneChan)
			wg.Wait()
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 20)
			So(results[0].Actor.Name, ShouldEqual, "Random User 30")
			So(results[19].Actor.Name, ShouldEqual, "Random User 11")

			results = results[:0]
			wg.Add(1)
			go func() {
				readResults(wg)
			}()
			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "charles", BoxInbox, "", 20, 100, "", resChan, doneChan)
			wg.Wait()
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 30)
			So(results[0].Actor.Name, ShouldEqual, "Random User 30")
			So(results[29].Actor.Name, ShouldEqual, "Random User 1")

			// GET LAST NOT SENT YET
			results = results[:0]
			wg.Add(1)
			go func() {
				readResults(wg)
			}()
			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "charles", BoxInbox, BoxLastSent, 0, 0, "", resChan, doneChan)
			wg.Wait()
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 50)
			So(results[0].Actor.Name, ShouldEqual, "Random User 50")
			err = dao.StoreLastUserInbox(ctx, "charles", BoxLastSent, results[0].Id)
			So(err, ShouldBeNil)

			// STORE 20 NEW ONES
			for i := 0; i < 20; i++ {
				ac := &activity.Object{
					Type: activity.ObjectType_Accept,
					Actor: &activity.Object{
						Type: activity.ObjectType_Person,
						Name: fmt.Sprintf("Random User %d", i+1+50),
						Id:   uuid.New(),
					},
				}
				err := dao.PostActivity(ctx, activity.OwnerType_USER, "charles", BoxInbox, ac, false)
				So(err, ShouldBeNil)
			}
			waitIfCache(dao)

			// NOW CHECK IF WE DO HAVE ONLY 20 RESULTS
			results = results[:0]
			wg.Add(1)
			go func() {
				readResults(wg)
			}()
			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "charles", BoxInbox, BoxLastSent, 0, 0, "", resChan, doneChan)
			wg.Wait()
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 20)
			So(results[0].Actor.Name, ShouldEqual, "Random User 70")
			So(results[19].Actor.Name, ShouldEqual, "Random User 51")

		})
	})
}

func TestStreamFilter(t *testing.T) {
	test.RunStorageTests(testCases(), func(ctx context.Context) {

		Convey("Test Filtering Stream", t, func() {

			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)
			searchUser := uuid.New()
			for i := 0; i < 50; i++ {
				userName := fmt.Sprintf("Random User %d", i+1)
				userId := uuid.New()
				if i%10 == 0 {
					userId = searchUser
					userName = "Search User"
				}
				fmt.Println("Insert", userName)
				ac := &activity.Object{
					Type: activity.ObjectType_Document,
					Actor: &activity.Object{
						Type: activity.ObjectType_Person,
						Name: userName,
						Id:   userId,
					},
					Object: &activity.Object{
						Id:   uuid.New(), // Make sure they are not all similar
						Name: fmt.Sprintf("Document-%d.pdf", i),
					},
				}
				err := dao.PostActivity(ctx, activity.OwnerType_USER, "charles", BoxInbox, ac, false)
				So(err, ShouldBeNil)
			}

			waitIfCache(dao)
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
			filter := "+actorId:" + searchUser
			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "charles", BoxInbox, "", 0, 20, filter, resChan, doneChan)
			wg.Wait()

			So(results, ShouldHaveLength, 5)

		})

	})
}

func TestSimilarSkipping(t *testing.T) {

	test.RunStorageTests(boltCases(), func(ctx context.Context) {

		Convey("Insert Activities and browse", t, func() {
			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			numberSimilar := 4
			startSimilar := 14

			for i := 0; i < 20; i++ {
				actorId := uuid.New()
				actorName := fmt.Sprintf("Random User %d", i+1)
				if i > startSimilar && i <= startSimilar+numberSimilar {
					actorId = "same-actor-id"
					actorName = "SameActorName"
				}
				ac := &activity.Object{
					Type: activity.ObjectType_Update,
					Actor: &activity.Object{
						Type: activity.ObjectType_Person,
						Name: actorName,
						Id:   actorId,
					},
					Object: &activity.Object{
						Id: "same-object-id",
					},
				}
				err := dao.PostActivity(ctx, activity.OwnerType_USER, "charles", BoxInbox, ac, false)
				So(err, ShouldBeNil)
			}

			waitIfCache(dao)
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
			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "charles", BoxInbox, "", 0, 20, "", resChan, doneChan)
			wg.Wait()
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 20-(numberSimilar-1))

			results = []*activity.Object{}
			wg = &sync.WaitGroup{}
			wg.Add(1)
			go func() {
				readResults(wg)
			}()
			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "charles", BoxInbox, "", 0, 4, "", resChan, doneChan)
			wg.Wait()
			So(err, ShouldBeNil)
			var res1 []string
			for _, r := range results {
				t.Log("0 - 4 : Received", r.Id)
				res1 = append(res1, r.Id)
			}

			results = []*activity.Object{}
			wg = &sync.WaitGroup{}
			wg.Add(1)
			go func() {
				readResults(wg)
			}()
			err = dao.ActivitiesFor(ctx, activity.OwnerType_USER, "charles", BoxInbox, "", 4, 4, "", resChan, doneChan)
			wg.Wait()
			So(err, ShouldBeNil)
			var res2 []string
			for _, r := range results {
				t.Log("5 - 8 : Received", r.Id)
				res2 = append(res2, r.Id)
			}
			// Check that there are no duplicates: all keys should be uniques
			union := map[string]struct{}{}
			for _, k1 := range res1 {
				union[k1] = struct{}{}
			}
			for _, k2 := range res2 {
				union[k2] = struct{}{}
			}
			So(union, ShouldHaveLength, len(res1)+len(res2))
		})
	})
}

func TestDelete(t *testing.T) {

	test.RunStorageTests(testCases(), func(ctx context.Context) {
		Convey("Test Delete Owner", t, func() {

			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			ac := &activity.Object{
				Type: activity.ObjectType_Travel,
				Actor: &activity.Object{
					Type: activity.ObjectType_Person,
					Name: "John Doe",
					Id:   "john",
				},
			}

			err = dao.PostActivity(ctx, activity.OwnerType_USER, "john", BoxInbox, ac, false)
			So(err, ShouldBeNil)

			waitIfCache(dao)

			err = dao.Delete(ctx, activity.OwnerType_USER, "john")
			So(err, ShouldBeNil)

			err = dao.Delete(ctx, activity.OwnerType_USER, "unknown")
			So(err, ShouldBeNil)

		})
	})
}

func TestPurge(t *testing.T) {

	test.RunStorageTests(testCases(), func(ctx context.Context) {

		dao, err := manager.Resolve[DAO](ctx)
		if err != nil {
			return
		}

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
			err := dao.ActivitiesFor(ctx, activity.OwnerType_USER, "john", BoxInbox, "", 0, 20, "", resChan, doneChan)
			wg.Wait()
			return results, err
		}

		Convey("Test Purge Activities", t, func() {
			logger := func(s string, _ int) {
				t.Log(s)
			}
			threeDays := 3 * time.Hour * 24
			ac1 := &activity.Object{Type: activity.ObjectType_Like, Updated: &timestamppb.Timestamp{Seconds: time.Now().Add(-threeDays).Unix()}}
			ac2 := &activity.Object{Type: activity.ObjectType_Accept, Updated: &timestamppb.Timestamp{Seconds: time.Now().Add(-threeDays).Add(-threeDays).Unix()}}
			ac3 := &activity.Object{Type: activity.ObjectType_Share, Updated: &timestamppb.Timestamp{Seconds: time.Now().Add(-threeDays).Add(-threeDays).Add(-threeDays).Unix()}}
			ac4 := &activity.Object{Type: activity.ObjectType_Share, Updated: &timestamppb.Timestamp{Seconds: time.Now().Add(-threeDays).Add(-threeDays).Add(-threeDays).Add(-threeDays).Unix()}}

			err := dao.PostActivity(ctx, activity.OwnerType_USER, "john", BoxInbox, ac4, false)
			So(err, ShouldBeNil)
			_ = dao.PostActivity(ctx, activity.OwnerType_USER, "john", BoxInbox, ac3, false)
			_ = dao.PostActivity(ctx, activity.OwnerType_USER, "john", BoxInbox, ac2, false)
			_ = dao.PostActivity(ctx, activity.OwnerType_USER, "john", BoxInbox, ac1, false)

			waitIfCache(dao)

			err = dao.Purge(nil, logger, activity.OwnerType_USER, "john", BoxInbox, 1, 100, time.Time{}, true, true)
			So(err, ShouldBeNil)
			dao, err = manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)

			results, err := listJohn()
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 4)

			err = dao.Purge(nil, logger, activity.OwnerType_USER, "john", BoxInbox, 1, 2, time.Time{}, true, true)
			So(err, ShouldBeNil)
			dao, err = manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)

			results, err = listJohn()
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

			// Now test purge by date
			//dao.PostActivity(activity.OwnerType_USER, "john", BoxInbox, ac2, nil)
			So(dao.PostActivity(ctx, activity.OwnerType_USER, "john", BoxInbox, ac4, false), ShouldBeNil)
			So(dao.PostActivity(ctx, activity.OwnerType_USER, "john", BoxInbox, ac3, false), ShouldBeNil)
			waitIfCache(dao)

			results, _ = listJohn()
			So(results, ShouldHaveLength, 4)

			sevenDays := 7 * time.Hour * 24
			err = dao.Purge(nil, logger, activity.OwnerType_USER, "john", BoxInbox, 0, 100, time.Now().Add(-sevenDays), true, true)
			So(err, ShouldBeNil)
			dao, err = manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)

			results, err = listJohn()
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

			// Purge by date all users - re-add ac3, ac4 removed in previous step
			So(dao.PostActivity(ctx, activity.OwnerType_USER, "john", BoxInbox, ac3, false), ShouldBeNil)
			So(dao.PostActivity(ctx, activity.OwnerType_USER, "john", BoxInbox, ac4, false), ShouldBeNil)
			waitIfCache(dao)

			err = dao.Purge(ctx, logger, activity.OwnerType_USER, "*", BoxInbox, 0, 100, time.Now().Add(-sevenDays), true, true)
			So(err, ShouldBeNil)
			dao, err = manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			results, err = listJohn()
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

		})
	})
}

func TestSubscriptions(t *testing.T) {

	test.RunStorageTests(testCases(), func(ctx context.Context) {

		Convey("Test subscribe", t, func() {
			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			sub := &activity.Subscription{
				UserId:     "user1",
				ObjectType: activity.OwnerType_NODE,
				ObjectId:   "ROOT",
				Events:     []string{"read", "write"},
			}
			err = dao.UpdateSubscription(nil, sub)
			So(err, ShouldBeNil)

			sub2 := &activity.Subscription{
				UserId:     "user1",
				ObjectType: activity.OwnerType_NODE,
				ObjectId:   "OTHER_NODE",
				Events:     []string{"read", "write"},
			}
			err = dao.UpdateSubscription(nil, sub2)
			So(err, ShouldBeNil)

			subs, err := dao.ListSubscriptions(nil, activity.OwnerType_NODE, []string{"ROOT"})
			So(err, ShouldBeNil)
			So(subs, ShouldHaveLength, 1)

			So(subs[0].Events, ShouldHaveLength, 2)
			So(subs[0].UserId, ShouldEqual, "user1")

		})

		Convey("Test unsubscribe", t, func() {

			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			sub := &activity.Subscription{
				UserId:     "user1",
				ObjectType: activity.OwnerType_NODE,
				ObjectId:   "ROOT",
				Events:     []string{},
			}

			err = dao.UpdateSubscription(nil, sub)
			So(err, ShouldBeNil)

			subs, err := dao.ListSubscriptions(nil, activity.OwnerType_NODE, []string{"ROOT"})
			So(err, ShouldBeNil)
			So(subs, ShouldHaveLength, 0)

		})
	})
}

func TestWsSorting(t *testing.T) {
	Convey("Test ws sorting - cells should appear first, then order by label", t, func() {
		var tss sortedWs
		tss = append(tss, &idm.Workspace{UUID: "a", Label: "Z", Scope: idm.WorkspaceScope_ADMIN})
		tss = append(tss, &idm.Workspace{UUID: "b", Label: "A", Scope: idm.WorkspaceScope_ADMIN})
		tss = append(tss, &idm.Workspace{UUID: "c", Label: "B", Scope: idm.WorkspaceScope_ROOM})
		tss = append(tss, &idm.Workspace{UUID: "d", Label: "Q", Scope: idm.WorkspaceScope_ROOM})
		sort.Sort(tss)
		So(tss[0].UUID, ShouldEqual, "c")
		So(tss[1].UUID, ShouldEqual, "d")
		So(tss[2].UUID, ShouldEqual, "b")
		So(tss[3].UUID, ShouldEqual, "a")
	})
}

func SkipTestMassiveQueries(t *testing.T) {

	test.RunStorageTests(testCases(), func(ctx context.Context) {

		Convey("Test massive queries", t, func() {

			dao, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			var er error
			for i := 0; i < 10000; i++ {
				ac := &activity.Object{
					Type: activity.ObjectType_Accept,
					Actor: &activity.Object{
						Type: activity.ObjectType_Person,
						Name: fmt.Sprintf("Random Activity %d", i+1),
						Id:   uuid.New(),
					},
				}
				if er = dao.PostActivity(ctx, activity.OwnerType_NODE, uuid.New(), BoxOutbox, ac, false); er != nil {
					break
				}

			}
			for i := 0; i < 100; i++ {
				ac := &activity.Object{
					Type: activity.ObjectType_Accept,
					Actor: &activity.Object{
						Type: activity.ObjectType_Person,
						Name: fmt.Sprintf("Random Activity %d", i+1),
						Id:   uuid.New(),
					},
				}
				if er = dao.PostActivity(ctx, activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, ac, false); er != nil {
					break
				}

			}

			So(er, ShouldBeNil)

			var results []*activity.Object
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

			now := time.Now()
			err = dao.ActivitiesFor(ctx, activity.OwnerType_NODE, "NODE-UUID", BoxOutbox, "", 0, 0, "", resChan, doneChan)
			wg.Wait()
			t.Log("Loading 20 activities took", time.Since(now))

			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 20)

		})
	})
}
