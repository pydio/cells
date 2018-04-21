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

package jobs

import (
	"log"
	"os"
	"sync"
	"testing"
	"time"

	google_protobuf "github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"github.com/micro/protobuf/ptypes"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
)

func TestNewBoltStore(t *testing.T) {

	Convey("Test open bolt db", t, func() {
		dbFile := os.TempDir() + "/bolt-test.db"
		defer os.Remove(dbFile)
		db, err := NewBoltStore(dbFile)
		defer db.Close()
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
	})

	Convey("Test open wrong file", t, func() {
		dbFile := os.TempDir() + "/watever-non-existing-folder/toto.db"
		_, err := NewBoltStore(dbFile)
		So(err, ShouldNotBeNil)
	})

}

func listAndCount(db *BoltStore, owner string, eventsOnly bool, timersOnly bool, withTasks jobs.TaskStatus) (int, error) {

	resCount := 0
	res, done, err := db.ListJobs(owner, eventsOnly, timersOnly, withTasks)
	So(err, ShouldBeNil)
	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case job := <-res:
				if job != nil {
					log.Println(job)
					resCount++
				}
			case <-done:
				return
			}
		}
	}()
	wg.Wait()

	return resCount, err
}

func TestBoltStore_CRUD(t *testing.T) {

	Convey("Test Put / Get / Delete", t, func() {

		dbFile := os.TempDir() + "/bolt-test-put.db"
		defer os.Remove(dbFile)
		db, err := NewBoltStore(dbFile)
		defer db.Close()
		So(err, ShouldBeNil)

		searchQuery, _ := ptypes.MarshalAny(&tree.Query{
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
							SubQueries: []*google_protobuf.Any{searchQuery},
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
		e3 := ptypes.UnmarshalAny(reparsedQuery, subQ)
		So(e3, ShouldBeNil)
		So(subQ.Extension, ShouldEqual, "jpg")

		e4 := db.DeleteJob("unique-job-id")
		So(e4, ShouldBeNil)
		deleted, e5 := db.GetJob("unique-job-id", 0)
		So(deleted, ShouldBeNil)
		So(errors.Parse(e5.Error()).Code, ShouldEqual, 404)
	})
}

func TestBoltStore_ListJobs(t *testing.T) {

	Convey("Test List Jobs", t, func() {

		dbFile := os.TempDir() + "/bolt-test-put.db"
		defer os.Remove(dbFile)
		db, err := NewBoltStore(dbFile)
		defer db.Close()
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
			resCount, err := listAndCount(db, "", false, false, 0)
			So(err, ShouldBeNil)
			So(resCount, ShouldEqual, 2)
		}

		{
			resCount, err := listAndCount(db, "userId", false, false, 0)
			So(err, ShouldBeNil)
			So(resCount, ShouldEqual, 1)
		}

		{
			resCount, err := listAndCount(db, "", true, false, 0)
			So(err, ShouldBeNil)
			So(resCount, ShouldEqual, 1)
		}

		{
			resCount, err := listAndCount(db, "", false, true, 0)
			So(err, ShouldBeNil)
			So(resCount, ShouldEqual, 1)
		}

		{
			resCount, err := listAndCount(db, "userId", false, true, 0)
			So(err, ShouldBeNil)
			So(resCount, ShouldEqual, 0)
		}

		db.PutTask(&jobs.Task{
			ID:        "unique-task-id",
			JobID:     "unique-id2",
			StartTime: int32(time.Now().Unix()),
			Progress:  0.65,
			Status:    jobs.TaskStatus_Running,
		})

		{
			resCount, err := listAndCount(db, "", false, false, jobs.TaskStatus_Running)
			So(err, ShouldBeNil)
			So(resCount, ShouldEqual, 1)
		}

		{
			resCount, err := listAndCount(db, "", false, false, jobs.TaskStatus_Any)
			So(err, ShouldBeNil)
			So(resCount, ShouldEqual, 2)
		}

		{
			resCount, err := listAndCount(db, "", false, false, jobs.TaskStatus_Finished)
			So(err, ShouldBeNil)
			So(resCount, ShouldEqual, 0)
		}

	})

}

func loadTasks(db *BoltStore, jobId string, jobStatus jobs.TaskStatus) ([]*jobs.Task, error) {

	tasksChan, doneChan, err := db.ListTasks(jobId, jobStatus)
	allTasks := []*jobs.Task{}
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

func TestBoltStore_PutTask(t *testing.T) {

	Convey("Test Put Task", t, func() {

		dbFile := os.TempDir() + "/bolt-test-tasks.db"
		defer os.Remove(dbFile)
		db, err := NewBoltStore(dbFile)
		So(err, ShouldBeNil)
		defer db.Close()

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
}

func TestBoltStore_listTask(t *testing.T) {

	Convey("Test Put Task", t, func() {

		dbFile := os.TempDir() + "/bolt-test-tasks-list.db"
		defer os.Remove(dbFile)
		db, err := NewBoltStore(dbFile)
		So(err, ShouldBeNil)
		defer db.Close()

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
}
