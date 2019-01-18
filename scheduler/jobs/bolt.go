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
	"encoding/json"
	"strings"
	"time"

	"github.com/boltdb/bolt"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
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

func (b *BoltStore) Close() {
	b.db.Close()
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
			return errors.NotFound(common.SERVICE_JOBS, "Job ID not found")
		}
		err := json.Unmarshal(data, j)
		if err != nil {
			return errors.InternalServerError(common.SERVICE_JOBS, "Cannot deserialize job")
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

func (s *BoltStore) ListJobs(owner string, eventsOnly bool, timersOnly bool, withTasks jobs.TaskStatus, taskCursor ...int32) (chan *jobs.Job, chan bool, error) {

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

func (s *BoltStore) PutTask(task *jobs.Task) error {

	jobId := task.JobID

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

	var index int32
	var lastOnly = offset == 0 && limit == 1
	var lastRecord *jobs.Task

	c := bucket.Cursor()
	for k, v := c.Last(); k != nil; k, v = c.Prev() {
		task := &jobs.Task{}
		if e := json.Unmarshal(v, task); e != nil {
			continue
		}
		if status != jobs.TaskStatus_Any && task.Status != status {
			continue
		}
		if lastOnly {
			if lastRecord == nil || task.StartTime > lastRecord.StartTime {
				lastRecord = task
			}
			continue
		}
		if offset > 0 && index < offset {
			index++
			continue
		}
		if limit > 0 && index >= offset+limit {
			break
		}
		if output != nil {
			output <- task
		}
		if sliceOutput != nil {
			sliceOutput = append(sliceOutput, task)
		}
		index++
	}

	if lastOnly && lastRecord != nil {
		if output != nil {
			output <- lastRecord
		}
		if sliceOutput != nil {
			sliceOutput = append(sliceOutput, lastRecord)
		}
	}

	return sliceOutput

}
