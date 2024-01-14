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
	"fmt"
	"sort"
	"strings"
	"time"

	bolt "go.etcd.io/bbolt"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/service/errors"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var (
	// Jobs Configurations
	jobsBucketKey = []byte("jobs")
	// Running tasks
	tasksBucketString = "tasks-"
)

type boltStore struct {
	*bolt.DB
}

func newBoltStore(db *bolt.DB) (*boltStore, error) {

	bs := &boltStore{
		DB: db,
	}

	er := db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists(jobsBucketKey)
		if err != nil {
			return err
		}
		return nil
	})

	if er != nil {
		return nil, er
	}
	return bs, nil

}

func (s *boltStore) PutJob(job *jobs.Job) error {

	err := s.DB.Update(func(tx *bolt.Tx) error {

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

func (s *boltStore) GetJob(jobId string, withTasks jobs.TaskStatus) (*jobs.Job, error) {

	j := &jobs.Job{}
	e := s.DB.View(func(tx *bolt.Tx) error {
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

func (s *boltStore) DeleteJob(jobID string) error {

	return s.DB.Update(func(tx *bolt.Tx) error {
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

func (s *boltStore) ListJobs(owner string, eventsOnly bool, timersOnly bool, withTasks jobs.TaskStatus, jobIDs []string, taskCursor ...int32) (chan *jobs.Job, error) {

	res := make(chan *jobs.Job)

	go func() {
		defer close(res)

		s.DB.View(func(tx *bolt.Tx) error {
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
	}()

	return res, nil
}

// PutTasks batch updates DB with tasks organized by JobID and TaskID
func (s *boltStore) PutTasks(tasks map[string]map[string]*jobs.Task) error {

	return s.DB.Update(func(tx *bolt.Tx) error {

		// First check buckets
		for jId, ts := range tasks {
			tasksBucket, err := tx.CreateBucketIfNotExists([]byte(tasksBucketString + jId))
			if err != nil {
				return err
			}
			for _, t := range ts {
				stripTaskData(t)
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

func (s *boltStore) PutTask(task *jobs.Task) error {

	jobId := task.JobID
	stripTaskData(task)

	return s.DB.Update(func(tx *bolt.Tx) error {

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

func (s *boltStore) DeleteTasks(jobId string, taskId []string) error {

	return s.DB.Update(func(tx *bolt.Tx) error {

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

func (s *boltStore) ListTasks(jobId string, taskStatus jobs.TaskStatus, cursor ...int32) (chan *jobs.Task, chan bool, error) {

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

		s.DB.View(func(tx *bolt.Tx) error {

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

func (s *boltStore) FindOrphans() (tt []*jobs.Task, e error) {
	return // Return empty slice without error, this cannot happen in bolt store
}

func (s *boltStore) BuildOrphanLogsQuery(since time.Duration, all []string) string {
	ids := []string{fmt.Sprintf("+Ts:<%d", time.Now().Add(-since).Unix())}
	for _, i := range all {
		ids = append(ids, "-OperationUuid:"+i)
	}
	return strings.Join(ids, " ")
}

func (s *boltStore) tasksToChan(bucket *bolt.Bucket, status jobs.TaskStatus, output chan *jobs.Task, offset int32, limit int32, sliceOutput []*jobs.Task) []*jobs.Task {

	c := bucket.Cursor()
	var all []*jobs.Task
	// Records are not sorted, load the whole bucket
	for k, v := c.First(); k != nil; k, v = c.Next() {
		task := &jobs.Task{}
		if e := json.Unmarshal(v, task); e != nil {
			continue
		}
		stripTaskData(task)
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
