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

package bolt

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"go.etcd.io/bbolt"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/errors"
	proto "github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/storage/boltdb"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/scheduler/jobs"
)

var (
	// Jobs Configurations
	jobsBucketKey = []byte("jobs")
	// Running tasks
	tasksBucketString = "tasks-"
)

func init() {
	jobs.Drivers.Register(NewBoltDAO)
}

func NewBoltDAO(db boltdb.DB) jobs.DAO {
	dao, _ := newBoltStore(db)
	return dao
}

type boltStore struct {
	boltdb.DB
}

func newBoltStore(db boltdb.DB) (*boltStore, error) {

	bs := &boltStore{
		DB: db,
	}

	er := db.Update(func(tx *bbolt.Tx) error {
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

func (s *boltStore) PutJob(job *proto.Job) error {

	err := s.DB.Update(func(tx *bbolt.Tx) error {

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

func (s *boltStore) GetJob(jobId string, withTasks proto.TaskStatus) (*proto.Job, error) {

	j := &proto.Job{}
	e := s.DB.View(func(tx *bbolt.Tx) error {
		// Assume bucket exists and has keys
		bucket := tx.Bucket(jobsBucketKey)
		data := bucket.Get([]byte(jobId))
		if data == nil {
			return errors.WithMessage(errors.StatusNotFound, "Job ID not found")
		}
		err := json.Unmarshal(data, j)
		if err != nil {
			return errors.WithMessage(errors.UnmarshalError, "Cannot deserialize job")
		}
		if withTasks != proto.TaskStatus_Unknown {
			j.Tasks = []*proto.Task{}
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

	return s.DB.Update(func(tx *bbolt.Tx) error {
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

func (s *boltStore) ListJobs(owner string, eventsOnly bool, timersOnly bool, withTasks proto.TaskStatus, jobIDs []string, taskCursor ...int32) (chan *proto.Job, error) {

	res := make(chan *proto.Job)

	go func() {
		defer close(res)

		s.DB.View(func(tx *bbolt.Tx) error {
			bucket := tx.Bucket(jobsBucketKey)
			c := bucket.Cursor()
			for k, v := c.First(); k != nil; k, v = c.Next() {
				j := &proto.Job{}
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
				if withTasks != proto.TaskStatus_Unknown {
					var offset, limit int32
					if len(taskCursor) == 2 {
						offset = taskCursor[0]
						limit = taskCursor[1]
					}
					j.Tasks = []*proto.Task{}
					jobTasksBucket := tx.Bucket([]byte(tasksBucketString + j.ID))
					if jobTasksBucket != nil {
						j.Tasks = s.tasksToChan(jobTasksBucket, withTasks, nil, offset, limit, j.Tasks)
					}
					if withTasks != proto.TaskStatus_Any {
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
func (s *boltStore) PutTasks(tasks map[string]map[string]*proto.Task) error {

	return s.DB.Update(func(tx *bbolt.Tx) error {

		// First check buckets
		for jId, ts := range tasks {
			tasksBucket, err := tx.CreateBucketIfNotExists([]byte(tasksBucketString + jId))
			if err != nil {
				return err
			}
			for _, t := range ts {
				jobs.StripTaskData(t)
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

func (s *boltStore) PutTask(task *proto.Task) error {

	jobId := task.JobID
	jobs.StripTaskData(task)

	return s.DB.Update(func(tx *bbolt.Tx) error {

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

	return s.DB.Update(func(tx *bbolt.Tx) error {

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

func (s *boltStore) ListTasks(jobId string, taskStatus proto.TaskStatus, cursor ...int32) (chan *proto.Task, chan bool, error) {

	results := make(chan *proto.Task)
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

		s.DB.View(func(tx *bbolt.Tx) error {

			if len(jobId) > 0 {
				jobTasksBucket := tx.Bucket([]byte(tasksBucketString + jobId))
				if jobTasksBucket == nil {
					return nil
				}
				s.tasksToChan(jobTasksBucket, taskStatus, results, offset, limit, nil)
			} else {
				tx.ForEach(func(name []byte, b *bbolt.Bucket) error {
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

func (s *boltStore) FindOrphans() (tt []*proto.Task, e error) {
	return // Return empty slice without error, this cannot happen in bolt store
}

func (s *boltStore) BuildOrphanLogsQuery(since time.Duration, all []string) string {
	ids := []string{fmt.Sprintf("+Ts:<%d", time.Now().Add(-since).Unix())}
	for _, i := range all {
		ids = append(ids, "-OperationUuid:"+i)
	}
	return strings.Join(ids, " ")
}

func (s *boltStore) tasksToChan(bucket *bbolt.Bucket, status proto.TaskStatus, output chan *proto.Task, offset int32, limit int32, sliceOutput []*proto.Task) []*proto.Task {

	c := bucket.Cursor()
	var all []*proto.Task
	// Records are not sorted, load the whole bucket
	for k, v := c.First(); k != nil; k, v = c.Next() {
		task := &proto.Task{}
		if e := json.Unmarshal(v, task); e != nil {
			continue
		}
		jobs.StripTaskData(task)
		if status != proto.TaskStatus_Any && task.Status != status {
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
