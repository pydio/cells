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

package grpc

import (
	"context"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"

	log3 "github.com/pydio/cells/v4/broker/log"
	logcore "github.com/pydio/cells/v4/broker/log/grpc"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	proto "github.com/pydio/cells/v4/common/proto/jobs"
	log2 "github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/scheduler/jobs"
	"github.com/pydio/cells/v4/scheduler/lang"
)

// JobsHandler implements the JobService API
type JobsHandler struct {
	proto.UnimplementedJobServiceServer
	proto.UnimplementedTaskServiceServer
	logcore.Handler
	store jobs.DAO

	putTaskChan       chan *proto.Task
	putTaskBuff       map[string]map[string]*proto.Task
	putTaskBuffLength int
	jobsBuff          map[string]*proto.Job
	jobsBuffLock      *sync.Mutex
	stop              chan bool
}

// NewJobsHandler creates a new JobsHandler
func NewJobsHandler(runtime context.Context, store jobs.DAO, messageRepository log3.MessageRepository) *JobsHandler {
	j := &JobsHandler{
		store:        store,
		putTaskChan:  make(chan *proto.Task),
		jobsBuff:     make(map[string]*proto.Job),
		jobsBuffLock: &sync.Mutex{},
		stop:         make(chan bool),
	}
	j.RuntimeCtx = runtime
	j.Handler.Repo = messageRepository
	j.Handler.HandlerName = ServiceName
	go j.watchPutTaskChan()
	return j
}

func (j *JobsHandler) Close() {
	close(j.stop)
}

func (j *JobsHandler) Name() string {
	return ServiceName
}

//////////////////
// JOBS STORE
/////////////////

func (j *JobsHandler) PutJob(ctx context.Context, request *proto.PutJobRequest) (*proto.PutJobResponse, error) {
	err := j.store.PutJob(request.Job)
	log.Logger(ctx).Debug("Scheduler PutJob", zap.Any("job", request.Job))
	if err != nil {
		return nil, err
	}
	response := &proto.PutJobResponse{}
	response.Job = request.Job
	broker.MustPublish(j.RuntimeCtx, common.TopicJobConfigEvent, &proto.JobChangeEvent{
		JobUpdated: request.Job,
	})
	return response, nil
}

func (j *JobsHandler) GetJob(ctx context.Context, request *proto.GetJobRequest) (*proto.GetJobResponse, error) {
	log.Logger(ctx).Debug("Scheduler GetJob", zap.String("jobId", request.JobID))
	job, err := j.store.GetJob(request.JobID, request.LoadTasks)
	if err != nil {
		return nil, err
	}
	response := &proto.GetJobResponse{}
	response.Job = job
	return response, nil
}

func (j *JobsHandler) DeleteJob(ctx context.Context, request *proto.DeleteJobRequest) (*proto.DeleteJobResponse, error) {

	response := &proto.DeleteJobResponse{}
	if request.JobID != "" {

		log.Logger(ctx).Debug("Scheduler DeleteJob", zap.String("jobId", request.JobID))
		err := j.store.DeleteJob(request.JobID)
		if err != nil {
			response.Success = false
			return nil, err
		}
		broker.MustPublish(j.RuntimeCtx, common.TopicJobConfigEvent, &proto.JobChangeEvent{
			JobRemoved: request.JobID,
		})
		go func() {
			j.DeleteLogsFor(j.RuntimeCtx, request.JobID)
		}()
		response.Success = true

	} else if request.CleanableJobs {

		log.Logger(ctx).Debug("Delete jobs with AutoClean that are finished")
		res, err := j.store.ListJobs("", false, false, proto.TaskStatus_Finished, []string{})
		if err != nil {
			return nil, err
		}
		var toDelete []string
		var deleted int32
		for job := range res {
			if job.AutoStart && job.AutoClean {
				toDelete = append(toDelete, job.ID)
			}
		}

		log.Logger(ctx).Debug("Delete jobs with AutoClean that are errored")
		res, err = j.store.ListJobs("", false, false, proto.TaskStatus_Error, []string{})
		if err != nil {
			return nil, err
		}
		for job := range res {
			if job.AutoStart && job.AutoClean {
				toDelete = append(toDelete, job.ID)
			}
		}

		for _, id := range toDelete {
			if e := j.store.DeleteJob(id); e == nil {
				deleted++
				log.Logger(ctx).Info("Deleting AutoClean Job " + id)
				broker.MustPublish(j.RuntimeCtx, common.TopicJobConfigEvent, &proto.JobChangeEvent{
					JobRemoved: id,
				})
				go func() {
					j.DeleteLogsFor(j.RuntimeCtx, id)
				}()

			}
		}
		response.DeleteCount = deleted
		response.Success = true
	}
	return response, nil
}

func (j *JobsHandler) ListJobs(request *proto.ListJobsRequest, streamer proto.JobService_ListJobsServer) error {

	ctx := streamer.Context()
	log.Logger(ctx).Debug("Scheduler ListJobs", zap.Any("req", request))

	res, err := j.store.ListJobs(request.Owner, request.EventsOnly, request.TimersOnly, request.LoadTasks, request.JobIDs, request.TasksOffset, request.TasksLimit)
	if err != nil {
		return err
	}

	for job := range res {
		if e := streamer.Send(&proto.ListJobsResponse{Job: job}); e != nil {
			return e
		}
	}

	return nil
	
}

//////////////////
// TASKS STORE
/////////////////

func (j *JobsHandler) PutTask(ctx context.Context, request *proto.PutTaskRequest) (*proto.PutTaskResponse, error) {

	job, e := j.store.GetJob(request.Task.JobID, 0)
	if e != nil {
		return nil, errors.NotFound(common.ServiceJobs, "Cannot append task to a non existing job ("+request.Task.JobID+")")
	}

	err := j.store.PutTask(request.Task)
	//log.Logger(ctx).Debug("Scheduler PutTask", zap.Any("task", request.Task))
	if err != nil {
		return nil, err
	}
	response := &proto.PutTaskResponse{}
	response.Task = request.Task
	T := lang.Bundle().GetTranslationFunc()
	job.Label = T(job.Label)
	if !job.TasksSilentUpdate {
		broker.MustPublish(j.RuntimeCtx, common.TopicJobTaskEvent, &proto.TaskChangeEvent{
			TaskUpdated: request.Task,
			Job:         job,
		})
	}

	return response, nil
}

func (j *JobsHandler) flush() {
	if j.putTaskBuff == nil {
		return
	}
	log.Logger(context.Background()).Debug("Now flushing", zap.Any("j", j.putTaskBuff))
	if err := j.store.PutTasks(j.putTaskBuff); err != nil {
		log.Logger(context.Background()).Error("Error while flushing tasks to store")
	}
	j.putTaskBuff = nil
	j.putTaskBuffLength = 0
}

func (j *JobsHandler) watchPutTaskChan() {
	for {
		select {
		case task := <-j.putTaskChan:
			if j.putTaskBuff == nil {
				j.putTaskBuff = make(map[string]map[string]*proto.Task)
			}
			if _, o := j.putTaskBuff[task.JobID]; !o {
				j.putTaskBuff[task.JobID] = make(map[string]*proto.Task)
			}
			var storeNow bool
			if stored, o := j.putTaskBuff[task.JobID][task.ID]; !o || stored.Status == proto.TaskStatus_Finished {
				storeNow = true
			}
			j.putTaskBuffLength++
			j.putTaskBuff[task.JobID][task.ID] = task
			if j.putTaskBuffLength > 500 {
				j.flush()
			} else if storeNow {
				log.Logger(context.Background()).Debug("Quick store of this task as it is new or finished", task.Zap())
				j.store.PutTask(task)
			}
		case <-time.After(3 * time.Second):
			j.flush()
		case <-j.stop:
			j.flush()
			return
		}
	}
}

func (j *JobsHandler) PutTaskStream(streamer proto.JobService_PutTaskStreamServer) error {

	ctx := streamer.Context()

	for {
		request, err := streamer.Recv()
		if request == nil {
			break
		}
		if err != nil {
			log.Logger(ctx).Debug("received an error in PutTaskStream", zap.Error(err))
			return err
		}
		t := request.Task
		var tJob *proto.Job
		j.jobsBuffLock.Lock()
		s, ok := j.jobsBuff[t.JobID]
		j.jobsBuffLock.Unlock()
		if !ok {
			job, e := j.store.GetJob(t.JobID, 0)
			if e != nil {
				return errors.NotFound(common.ServiceJobs, "Cannot append task to a non existing job ("+request.Task.JobID+")")
			}
			j.jobsBuffLock.Lock()
			j.jobsBuff[t.JobID] = job
			j.jobsBuffLock.Unlock()
			tJob = job
		} else {
			tJob = s
		}
		j.putTaskChan <- t
		sendErr := streamer.Send(&proto.PutTaskResponse{
			Task: t,
		})
		T := lang.Bundle().GetTranslationFunc()
		tJob.Label = T(tJob.Label)
		if !tJob.TasksSilentUpdate {
			broker.MustPublish(j.RuntimeCtx, common.TopicJobTaskEvent, &proto.TaskChangeEvent{
				TaskUpdated: request.Task,
				Job:         tJob,
			})
		}
		if sendErr != nil {
			return sendErr
		}
	}

	return nil
}

func (j *JobsHandler) ListTasks(request *proto.ListTasksRequest, streamer proto.JobService_ListTasksServer) error {

	ctx := streamer.Context()
	log.Logger(ctx).Debug("Scheduler ListTasks")

	res, done, err := j.store.ListTasks(request.JobID, request.Status)
	defer close(res)
	if err != nil {
		return err
	}

	for {
		select {
		case <-done:
			return nil
		case t := <-res:
			if e := streamer.Send(&proto.ListTasksResponse{Task: t}); e != nil {
				return e
			}
		}
	}
}

func (j *JobsHandler) DeleteTasks(ctx context.Context, request *proto.DeleteTasksRequest) (*proto.DeleteTasksResponse, error) {

	response := &proto.DeleteTasksResponse{}
	// Delete Tasks by Status, either for one job or for all jobs
	if len(request.Status) > 0 {

		toDelete := make(map[string][]string)
		for _, status := range request.Status {

			res, done, err := j.store.ListTasks(request.JobId, status, request.PruneLimit)
			defer close(res)
			if err != nil {
				return nil, err
			}

		loop:
			for {
				select {
				case <-done:
					break loop
				case t := <-res:
					var tasks []string
					var has bool
					if tasks, has = toDelete[t.JobID]; !has {
						tasks = []string{t.ID}
					} else {
						tasks = append(tasks, t.ID)
					}
					toDelete[t.JobID] = tasks
				}
			}
		}
		for jId, tasks := range toDelete {
			if e := j.store.DeleteTasks(jId, tasks); e != nil {
				return nil, e
			}
			response.Deleted = append(response.Deleted, tasks...)
			go func(jI string, tt ...string) {
				j.DeleteLogsFor(j.RuntimeCtx, jI, tt...)
			}(jId, tasks...)
		}
		return response, nil

	} else if request.JobId != "" && len(request.TaskID) > 0 {

		if e := j.store.DeleteTasks(request.JobId, request.TaskID); e == nil {
			response.Deleted = append(response.Deleted, request.TaskID...)
			go func() {
				j.DeleteLogsFor(j.RuntimeCtx, request.JobId, request.TaskID...)
			}()
			return response, nil
		} else {
			return nil, e
		}

	} else {

		return nil, errors.BadRequest(common.ServiceJobs, "DeleteTasks: provide either status values or jobId/taskId parameters")

	}

}

func (j *JobsHandler) DeleteLogsFor(ctx context.Context, job string, tasks ...string) (int64, error) {
	var req = &log2.ListLogRequest{}
	if len(tasks) == 0 {
		req.Query = "+OperationUuid:\"" + job + "*\""
	} else {
		qs := []string{}
		for _, task := range tasks {
			qs = append(qs, "+OperationUuid:\""+job+"-"+task[0:8]+"\"")
		}
		req.Query = strings.Join(qs, " ")
	}
	if resp, e := j.DeleteLogs(ctx, req); e != nil {
		log.Logger(ctx).Error("Deleting logs in background for ", zap.String("j", job), zap.Strings("t", tasks), zap.Error(e))
		return 0, e
	} else {
		log.Logger(ctx).Debug("Deleting logs in background for ", zap.String("j", job), zap.Strings("t", tasks), zap.Any("count", resp.Deleted))
		return resp.Deleted, nil
	}
}

func (j *JobsHandler) DetectStuckTasks(ctx context.Context, request *proto.DetectStuckTasksRequest) (*proto.DetectStuckTasksResponse, error) {

	since := request.Since
	var durations []time.Duration
	if since > 0 {
		durations = append(durations, time.Duration(since)*time.Second)
	}
	tasks, e := j.CleanStuckTasks(ctx, durations...)
	if e != nil {
		return nil, e
	}
	response := &proto.DetectStuckTasksResponse{}
	for _, t := range tasks {
		response.FixedTaskIds = append(response.FixedTaskIds, t.ID)
	}

	return response, nil
}

// CleanStuckTasks may be run at startup to
func (j *JobsHandler) CleanStuckTasks(ctx context.Context, duration ...time.Duration) ([]*proto.Task, error) {

	var fixedTasks []*proto.Task

	res, done, err := j.store.ListTasks("", proto.TaskStatus_Running)
	defer close(res)
	if err != nil {
		return fixedTasks, err
	}
	for {
		select {

		case <-done:
			for _, t := range fixedTasks {
				log.Logger(ctx).Info("Setting task " + t.ID + " in error status as it was saved as running")
				j.store.PutTask(t)
			}
			return fixedTasks, nil

		case t := <-res:
			t.Status = proto.TaskStatus_Error
			t.StatusMessage = "Task stuck"
			t.EndTime = int32(time.Now().Unix())
			if len(duration) > 0 && t.StartTime > 0 {
				check := duration[0]
				startTime := time.Unix(int64(t.StartTime), 0)
				if time.Since(startTime) > check {
					fixedTasks = append(fixedTasks, t)
				}
			} else {
				fixedTasks = append(fixedTasks, t)
			}
		}
	}

}
