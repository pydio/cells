//go:build storage

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

package dao

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/uuid"
	jo "github.com/pydio/cells/v5/scheduler/jobs"
	"github.com/pydio/cells/v5/scheduler/jobs/dao/bolt"
	"github.com/pydio/cells/v5/scheduler/jobs/dao/mongo"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testCases = []test.StorageTestCase{
		{DSN: []string{"boltdb://" + filepath.Join(os.TempDir(), "jobs_bolt_"+uuid.New()+".db")}, Condition: true, DAO: bolt.NewBoltDAO},
		test.TemplateMongoEnvWithPrefix(mongo.NewMongoDAO, "jobs_"+uuid.New()[:6]+"_"),
	}
)

//func TestNewBoltStore(t *testing.T) {
//
//	Convey("Test open bolt db", t, func() {
//		dbFile := os.TempDir() + "/bolt-test.db"
//		ctx := context.Background()
//		dao, _ := boltdb.NewDAO(ctx, "boltdb", dbFile, "test-jobs")
//		defer os.Remove(dbFile)
//		db, err := newBoltStore(dao.(boltdb.DAO))
//		defer dao.CloseConn(ctx)
//		So(err, ShouldBeNil)
//		So(db, ShouldNotBeNil)
//	})
//
//}
//
//func initDAO(name string) (DAO, func()) {
//
//	name = "jobs-" + name
//	d, c, e := test.OnFileTestDAO("boltdb", filepath.Join(os.TempDir(), name+".db"), "", "jobs-tests", false, NewDAO)
//	if e != nil {
//		log.Fatal(e)
//	}
//	return d.(DAO), c
//
//}

func TestDAO_CRUD(t *testing.T) {

	test.RunStorageTests(testCases, t, func(ctx context.Context) {
		Convey("Test Put / Get / Delete", t, func() {
			db, err := manager.Resolve[jo.DAO](ctx)
			So(err, ShouldBeNil)

			searchQuery, _ := anypb.New(&tree.Query{
				Extension: "jpg",
			})

			e := db.PutJob(&jobs.Job{
				ID:             "unique-job-id",
				Owner:          "userId",
				Label:          "My Test Job",
				Inactive:       false,
				MaxConcurrency: 20,
				EventNames:     []string{"NODE_CREATE", "NODE_UPDATE"},
				Actions: []*jobs.Action{
					{
						ID:         "CreateThumbnail",
						Parameters: map[string]string{"Quality": "10"},
						NodesSelector: &jobs.NodesSelector{
							Query: &service.Query{
								SubQueries: []*anypb.Any{searchQuery},
							},
						},
					},
				},
			})

			So(e, ShouldBeNil)

			saved, e2 := db.GetJob("unique-job-id", 0)
			So(e2, ShouldBeNil)
			So(saved, ShouldNotBeNil)

			reparsedQuery := saved.Actions[0].NodesSelector.Query.SubQueries[0]
			subQ := &tree.Query{}
			e3 := anypb.UnmarshalTo(reparsedQuery, subQ, proto.UnmarshalOptions{})
			So(e3, ShouldBeNil)
			So(subQ.Extension, ShouldEqual, "jpg")

			e4 := db.DeleteJob("unique-job-id")
			So(e4, ShouldBeNil)
			deleted, e5 := db.GetJob("unique-job-id", 0)
			So(deleted, ShouldBeNil)
			So(errors.Is(e5, errors.StatusNotFound), ShouldBeTrue)
		})
	})
}

func TestDAO_ListJobs(t *testing.T) {

	test.RunStorageTests(testCases, t, func(ctx context.Context) {
		Convey("Test List Jobs", t, func() {

			db, err := manager.Resolve[jo.DAO](ctx)
			So(err, ShouldBeNil)

			db.PutJob(&jobs.Job{
				ID:             "unique-job-id",
				Owner:          "userId",
				Label:          "My Test Job",
				Inactive:       false,
				MaxConcurrency: 20,
				EventNames:     []string{"NODE_CREATE", "NODE_UPDATE"},
				Actions: []*jobs.Action{
					{ID: "CreateThumbnail", Parameters: map[string]string{"Quality": "10"}},
				},
			})

			db.PutJob(&jobs.Job{
				ID:             "unique-id2",
				Owner:          "admin",
				Label:          "My Other Job",
				Inactive:       false,
				MaxConcurrency: 20,
				Schedule: &jobs.Schedule{
					Iso8601Schedule: "R2/2015-06-04T19:25:16.828696-07:00/PT5M", // Every 5 minutes
					Iso8601MinDelta: "PT1M",                                     // Minimum 1 minute
				},
				Actions: []*jobs.Action{
					{ID: "Resync", Parameters: map[string]string{"Service": "pydio.api.mindiods1.sync"}},
				},
			})

			{
				_, resCount, err := listAndCount(db, "", false, false, 0)
				So(err, ShouldBeNil)
				So(resCount, ShouldEqual, 2)
			}

			{
				_, resCount, err := listAndCount(db, "userId", false, false, 0)
				So(err, ShouldBeNil)
				So(resCount, ShouldEqual, 1)
			}

			{
				_, resCount, err := listAndCount(db, "", true, false, 0)
				So(err, ShouldBeNil)
				So(resCount, ShouldEqual, 1)
			}

			{
				_, resCount, err := listAndCount(db, "", false, true, 0)
				So(err, ShouldBeNil)
				So(resCount, ShouldEqual, 1)
			}

			{
				_, resCount, err := listAndCount(db, "userId", false, true, 0)
				So(err, ShouldBeNil)
				So(resCount, ShouldEqual, 0)
			}

			db.PutTask(&jobs.Task{
				ID:        "unique-task-id",
				JobID:     "unique-id2",
				StartTime: int32(time.Now().Add(-10 * time.Second).Unix()),
				EndTime:   int32(time.Now().Add(-10 * time.Second).Unix()),
				Progress:  0.65,
				Status:    jobs.TaskStatus_Running,
			})
			recent := int32(time.Now().Add(-5 * time.Second).Unix())
			db.PutTask(&jobs.Task{
				ID:        "unique-task-id-2",
				JobID:     "unique-id2",
				StartTime: recent,
				EndTime:   recent,
				Progress:  0.65,
				Status:    jobs.TaskStatus_Running,
			})
			db.PutTask(&jobs.Task{
				ID:        "unique-task-id-3",
				JobID:     "unique-id2",
				StartTime: int32(time.Now().Add(-15 * time.Second).Unix()),
				EndTime:   int32(time.Now().Add(-15 * time.Second).Unix()),
				Progress:  0.65,
				Status:    jobs.TaskStatus_Running,
			})

			{
				_, resCount, err := listAndCount(db, "", false, false, jobs.TaskStatus_Running)
				So(err, ShouldBeNil)
				So(resCount, ShouldEqual, 1)
			}

			{
				_, resCount, err := listAndCount(db, "", false, false, jobs.TaskStatus_Any)
				So(err, ShouldBeNil)
				So(resCount, ShouldEqual, 2)
			}

			{
				_, resCount, err := listAndCount(db, "", false, false, jobs.TaskStatus_Finished)
				So(err, ShouldBeNil)
				So(resCount, ShouldEqual, 0)
			}
			{
				jobList, _, e := listAndCount(db, "", false, false, jobs.TaskStatus_Any, 0, 1)
				So(e, ShouldBeNil)
				So(jobList, ShouldNotBeEmpty)
				loaded, ok := jobList["unique-id2"]
				So(ok, ShouldBeTrue)
				So(loaded.Tasks, ShouldHaveLength, 1)
				So(loaded.Tasks[0].StartTime, ShouldEqual, recent)
				So(loaded.Tasks[0].ID, ShouldEqual, "unique-task-id-2")
			}
			{
				jobList, _, e := listAndCount(db, "", false, false, jobs.TaskStatus_Any, 1, 0)
				So(e, ShouldBeNil)
				So(jobList, ShouldNotBeEmpty)
				loaded, ok := jobList["unique-id2"]
				So(ok, ShouldBeTrue)
				fmt.Println(loaded)
				So(loaded.Tasks, ShouldHaveLength, 2)
			}
			{
				jobList, _, e := listAndCount(db, "", false, false, jobs.TaskStatus_Any, 1, 1)
				So(e, ShouldBeNil)
				So(jobList, ShouldNotBeEmpty)
				loaded, ok := jobList["unique-id2"]
				So(ok, ShouldBeTrue)
				So(loaded.Tasks, ShouldHaveLength, 1)
			}

		})

	})

}

func listAndCount(db jo.DAO, owner string, eventsOnly bool, timersOnly bool, withTasks jobs.TaskStatus, taskCursor ...int32) (map[string]*jobs.Job, int, error) {

	resCount := 0
	res, err := db.ListJobs(owner, eventsOnly, timersOnly, withTasks, []string{}, taskCursor...)
	So(err, ShouldBeNil)
	wg := &sync.WaitGroup{}
	wg.Add(1)
	list := make(map[string]*jobs.Job)
	for job := range res {
		if job != nil {
			log.Println(job)
			list[job.ID] = job
			resCount++
		}
	}
	/*
		go func() {
			defer wg.Done()
			for {
				select {
				case job := <-res:
					if job != nil {
						log.Println(job)
						list[job.ID] = job
						resCount++
					}
				case <-done:
					close(res)
					return
				}
			}
		}()
		wg.Wait()
	*/

	return list, resCount, err
}

func loadTasks(db jo.DAO, jobId string, jobStatus jobs.TaskStatus, offset ...int32) ([]*jobs.Task, error) {

	tasksChan, doneChan, err := db.ListTasks(jobId, jobStatus, offset...)
	var allTasks []*jobs.Task
	if err != nil {
		return allTasks, err
	}
	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case t := <-tasksChan:
				allTasks = append(allTasks, t)
			case <-doneChan:
				return
			}
		}
	}()
	wg.Wait()
	return allTasks, nil
}

func TestDAO_PutTask(t *testing.T) {

	test.RunStorageTests(testCases, t, func(ctx context.Context) {
		Convey("Test Put Task", t, func() {
			db, err := manager.Resolve[jo.DAO](ctx)
			So(err, ShouldBeNil)

			e := db.PutTask(&jobs.Task{
				ID:        "unique-task-id",
				JobID:     "corresponding-job-id",
				StartTime: int32(time.Now().Unix()),
				Progress:  0.65,
				Status:    jobs.TaskStatus_Running,
			})

			So(e, ShouldBeNil)
			allTasks, err := loadTasks(db, "corresponding-job-id", jobs.TaskStatus_Any)
			So(err, ShouldBeNil)
			So(allTasks, ShouldHaveLength, 1)

		})
	})
}

func TestDAO_listTask(t *testing.T) {

	test.RunStorageTests(testCases, t, func(ctx context.Context) {
		Convey("Test Put Task", t, func() {

			db, err := manager.Resolve[jo.DAO](ctx)
			So(err, ShouldBeNil)

			e := db.PutTask(&jobs.Task{
				ID:        "unique-task-id",
				JobID:     "job-id-1",
				StartTime: int32(time.Now().Unix()),
				Progress:  0.65,
				Status:    jobs.TaskStatus_Running,
			})

			e = db.PutTask(&jobs.Task{
				ID:        "unique-task-id2",
				JobID:     "job-id-1",
				StartTime: int32(time.Now().Unix()),
				Progress:  0.65,
				Status:    jobs.TaskStatus_Finished,
			})

			e = db.PutTask(&jobs.Task{
				ID:        "unique-task-id3",
				JobID:     "job-id-2",
				StartTime: int32(time.Now().Unix()),
				Progress:  0.65,
				Status:    jobs.TaskStatus_Running,
			})

			e = db.PutTask(&jobs.Task{
				ID:        "unique-task-id4",
				JobID:     "job-id-3",
				StartTime: int32(time.Now().Unix()),
				Progress:  0.65,
				Status:    jobs.TaskStatus_Idle,
			})

			So(e, ShouldBeNil)

			allTasks, err := loadTasks(db, "job-id-1", jobs.TaskStatus_Any)
			So(err, ShouldBeNil)
			So(allTasks, ShouldHaveLength, 2)

			allTasks, err = loadTasks(db, "job-id-1", jobs.TaskStatus_Any, 1)
			So(err, ShouldBeNil)
			So(allTasks, ShouldHaveLength, 1)

			allTasks, err = loadTasks(db, "job-id-1", jobs.TaskStatus_Any, 50)
			So(err, ShouldBeNil)
			So(allTasks, ShouldHaveLength, 0)

			allTasks, err = loadTasks(db, "job-id-1", jobs.TaskStatus_Running)
			So(err, ShouldBeNil)
			So(allTasks, ShouldHaveLength, 1)

			allTasks, err = loadTasks(db, "", jobs.TaskStatus_Running)
			So(err, ShouldBeNil)
			So(allTasks, ShouldHaveLength, 2)

			allTasks, err = loadTasks(db, "", jobs.TaskStatus_Any)
			So(err, ShouldBeNil)
			So(allTasks, ShouldHaveLength, 4)

		})
	})
}
