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
	"context"
	"sort"
	"strings"
	"time"

	json "github.com/pydio/cells/x/jsonx"

	bolt "github.com/etcd-io/bbolt"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
)

var (
	// Jobs Configurations
	jobsBucketKey = []byte("jobs")
	// Running tasks
	tasksBucketString = "tasks-"
)

type BoltStore struct {
	db *bolt.DB
}

func NewBoltStore(fileName string) (*BoltStore, error) {

	bs := &BoltStore{}

	options := bolt.DefaultOptions
	options.Timeout = 5 * time.Second
	db, err := bolt.Open(fileName, 0644, options)
	if err != nil {
		return nil, err
	}
	er := db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists(jobsBucketKey)
		if err != nil {
			return err
		}
		return nil
	})
	if er != nil {
		db.Close()
		return nil, er
	}
	bs.db = db
	return bs, nil

}

func (s *BoltStore) Close() {
	s.db.Close()
}

func (s *BoltStore) PutJob(job *jobs.Job) error {

	err := s.db.Update(func(tx *bolt.Tx) error {

		bucket := tx.Bucket(jobsBucketKey)
		if job.Tasks != nil {
			// Do not store that
			job.Tasks = nil
		}
		jsonData, err := json.Marshal(job)
		if err != nil {
			return err
		}
		return bucket.Put([]byte(job.ID), jsonData)

	})
	return err

}

func (s *BoltStore) GetJob(jobId string, withTasks jobs.TaskStatus) (*jobs.Job, error) {

	j := &jobs.Job{}
	e := s.db.View(func(tx *bolt.Tx) error {
		// Assume bucket exists and has keys
		bucket := tx.Bucket(jobsBucketKey)
		data := bucket.Get([]byte(jobId))
		if data == nil {
			return errors.NotFound(common.ServiceJobs, "Job ID not found")
		}
		err := json.Unmarshal(data, j)
		if err != nil {
			return errors.InternalServerError(common.ServiceJobs, "Cannot deserialize job")
		}
		if withTasks != jobs.TaskStatus_Unknown {
			j.Tasks = []*jobs.Task{}
			jobTasksBucket := tx.Bucket([]byte(tasksBucketString + jobId))
			if jobTasksBucket != nil {
				j.Tasks = s.tasksToChan(jobTasksBucket, withTasks, nil, 0, 0, j.Tasks)
			}
		}
		return nil
	})
	if e != nil {
		return nil, e
	}
	return j, nil

}

func (s *BoltStore) DeleteJob(jobID string) error {

	return s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket(jobsBucketKey)
		err := bucket.Delete([]byte(jobID))
		if err == nil {
			jobTasksBucket := tx.Bucket([]byte(tasksBucketString + jobID))
			if jobTasksBucket != nil {
				err = tx.DeleteBucket([]byte(tasksBucketString + jobID))
			}
		}
		if err != nil {
			log.Logger(context.Background()).Error("Error on Job Deletion: ", zap.Error(err))
		}
		return err
	})

}

func (s *BoltStore) ListJobs(owner string, eventsOnly bool, timersOnly bool, withTasks jobs.TaskStatus, jobIDs []string, taskCursor ...int32) (chan *jobs.Job, chan bool, error) {

	res := make(chan *jobs.Job)
	done := make(chan bool)

	go func() {

		s.db.View(func(tx *bolt.Tx) error {
			bucket := tx.Bucket(jobsBucketKey)
			c := bucket.Cursor()
			for k, v := c.First(); k != nil; k, v = c.Next() {
				j := &jobs.Job{}
				err := json.Unmarshal(v, j)
				if err != nil {
					continue
				}
				if (owner != "" && j.Owner != owner) || (eventsOnly && len(j.EventNames) == 0) || (timersOnly && j.Schedule == nil) {
					continue
				}
				if len(jobIDs) > 0 {
					var found bool
					for _, jID := range jobIDs {
						if jID == j.ID {
							found = true
							break
						}
					}
					if !found {
						continue
					}
				}
				if withTasks != jobs.TaskStatus_Unknown {
					var offset, limit int32
					if len(taskCursor) == 2 {
						offset = taskCursor[0]
						limit = taskCursor[1]
					}
					j.Tasks = []*jobs.Task{}
					jobTasksBucket := tx.Bucket([]byte(tasksBucketString + j.ID))
					if jobTasksBucket != nil {
						j.Tasks = s.tasksToChan(jobTasksBucket, withTasks, nil, offset, limit, j.Tasks)
					}
					if withTasks != jobs.TaskStatus_Any {
						if len(j.Tasks) > 0 {
							res <- j
						}
						continue
					}
				}
				res <- j
			}
			return nil
		})

		done <- true
		close(done)
	}()

	return res, done, nil
}

// PutTasks batch updates DB with tasks organized by JobID and TaskID
func (s *BoltStore) PutTasks(tasks map[string]map[string]*jobs.Task) error {

	return s.db.Update(func(tx *bolt.Tx) error {

		// First check buckets
		for jId, ts := range tasks {
			tasksBucket, err := tx.CreateBucketIfNotExists([]byte(tasksBucketString + jId))
			if err != nil {
				return err
			}
			for _, t := range ts {
				s.stripTaskData(t)
				jsonData, err := json.Marshal(t)
				if err != nil {
					return err
				}
				e := tasksBucket.Put([]byte(t.ID), jsonData)
				if e != nil {
					return e
				}
			}
		}
		return nil
	})

}

func (s *BoltStore) PutTask(task *jobs.Task) error {

	jobId := task.JobID
	s.stripTaskData(task)

	return s.db.Update(func(tx *bolt.Tx) error {

		tasksBucket, err := tx.CreateBucketIfNotExists([]byte(tasksBucketString + jobId))
		if err != nil {
			return err
		}
		jsonData, err := json.Marshal(task)
		if err != nil {
			return err
		}
		return tasksBucket.Put([]byte(task.ID), jsonData)

	})

}

func (s *BoltStore) DeleteTasks(jobId string, taskId []string) error {

	return s.db.Update(func(tx *bolt.Tx) error {

		tasksBucket := tx.Bucket([]byte(tasksBucketString + jobId))
		if tasksBucket == nil {
			return nil
		}
		for _, tId := range taskId {
			tasksBucket.Delete([]byte(tId))
		}
		return nil
	})

}

func (s *BoltStore) ListTasks(jobId string, taskStatus jobs.TaskStatus, cursor ...int32) (chan *jobs.Task, chan bool, error) {

	results := make(chan *jobs.Task)
	done := make(chan bool)
	var offset int32
	var limit int32
	if len(cursor) > 0 {
		offset = cursor[0]
	}
	if len(cursor) > 1 {
		limit = cursor[1]
	}

	go func() {

		s.db.View(func(tx *bolt.Tx) error {

			if len(jobId) > 0 {
				jobTasksBucket := tx.Bucket([]byte(tasksBucketString + jobId))
				if jobTasksBucket == nil {
					return nil
				}
				s.tasksToChan(jobTasksBucket, taskStatus, results, offset, limit, nil)
			} else {
				tx.ForEach(func(name []byte, b *bolt.Bucket) error {
					if strings.HasPrefix(string(name), tasksBucketString) {
						s.tasksToChan(b, taskStatus, results, offset, limit, nil)
					}
					return nil
				})

			}
			done <- true
			close(done)
			return nil
		})

	}()

	return results, done, nil
}

func (s *BoltStore) tasksToChan(bucket *bolt.Bucket, status jobs.TaskStatus, output chan *jobs.Task, offset int32, limit int32, sliceOutput []*jobs.Task) []*jobs.Task {

	c := bucket.Cursor()
	var all []*jobs.Task
	// Records are not sorted, load the whole bucket
	for k, v := c.First(); k != nil; k, v = c.Next() {
		task := &jobs.Task{}
		if e := json.Unmarshal(v, task); e != nil {
			continue
		}
		s.stripTaskData(task)
		if status != jobs.TaskStatus_Any && task.Status != status {
			continue
		}
		all = append(all, task)
	}
	sort.Slice(all, func(i, j int) bool {
		return all[i].StartTime > all[j].StartTime
	})
	if offset > 0 {
		if int(offset) < len(all) {
			all = all[offset:]
		} else {
			all = nil
		}
	}
	if limit > 0 && int(limit) < len(all) {
		all = all[:limit]
	}
	if sliceOutput != nil {
		sliceOutput = append(sliceOutput, all...)
	}
	if output != nil {
		for _, t := range all {
			output <- t
		}
	}

	return sliceOutput

}

// stripTaskData removes unnecessary data from the task log
// like fully loaded users, nodes, activities, etc.
func (s *BoltStore) stripTaskData(task *jobs.Task) {
	for _, l := range task.ActionsLogs {
		if l.InputMessage != nil {
			s.stripTaskMessage(l.InputMessage)
		}
		if l.OutputMessage != nil {
			s.stripTaskMessage(l.OutputMessage)
		}
	}
}

func (s *BoltStore) stripTaskMessage(message *jobs.ActionMessage) {
	for i, n := range message.Nodes {
		message.Nodes[i] = &tree.Node{Uuid: n.Uuid, Path: n.Path}
	}
	for i, u := range message.Users {
		message.Users[i] = &idm.User{Uuid: u.Uuid, Login: u.Login, GroupPath: u.GroupPath, GroupLabel: u.GroupLabel, IsGroup: u.IsGroup}
	}
	for i, a := range message.Activities {
		message.Activities[i] = &activity.Object{Id: a.Id}
	}
}
