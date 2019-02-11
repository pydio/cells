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
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	logcore "github.com/pydio/cells/broker/log/grpc"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	proto "github.com/pydio/cells/common/proto/jobs"
	log2 "github.com/pydio/cells/common/proto/log"
	"github.com/pydio/cells/scheduler/jobs"
	"github.com/pydio/cells/scheduler/lang"
)

// JobsHandler implements the JobService API
type JobsHandler struct {
	logcore.Handler
	store jobs.DAO
}

//////////////////
// JOBS STORE
/////////////////
func (j *JobsHandler) PutJob(ctx context.Context, request *proto.PutJobRequest, response *proto.PutJobResponse) error {
	err := j.store.PutJob(request.Job)
	log.Logger(ctx).Debug("Scheduler PutJob", zap.Any("job", request.Job))
	if err != nil {
		return err
	}
	response.Job = request.Job
	client.Publish(ctx, client.NewPublication(common.TOPIC_JOB_CONFIG_EVENT, &proto.JobChangeEvent{
		JobUpdated: request.Job,
	}))
	if request.Job.AutoStart && !request.Job.Inactive {
		client.Publish(ctx, client.NewPublication(common.TOPIC_TIMER_EVENT, &proto.JobTriggerEvent{
			JobID:  response.Job.ID,
			RunNow: true,
		}))
	}
	return nil
}

func (j *JobsHandler) GetJob(ctx context.Context, request *proto.GetJobRequest, response *proto.GetJobResponse) error {
	log.Logger(ctx).Debug("Scheduler GetJob", zap.String("jobId", request.JobID))
	job, err := j.store.GetJob(request.JobID, request.LoadTasks)
	if err != nil {
		return err
	}
	response.Job = job
	return nil
}

func (j *JobsHandler) DeleteJob(ctx context.Context, request *proto.DeleteJobRequest, response *proto.DeleteJobResponse) error {
	if request.JobID != "" {

		log.Logger(ctx).Debug("Scheduler DeleteJob", zap.String("jobId", request.JobID))
		err := j.store.DeleteJob(request.JobID)
		if err != nil {
			response.Success = false
			return err
		}
		client.Publish(ctx, client.NewPublication(common.TOPIC_JOB_CONFIG_EVENT, &proto.JobChangeEvent{
			JobRemoved: request.JobID,
		}))
		go func() {
			j.DeleteLogsFor(ctx, request.JobID, "")
		}()
		response.Success = true

	} else if request.CleanableJobs {

		log.Logger(ctx).Debug("Delete jobs with AutoClean that are finished")
		res, done, err := j.store.ListJobs("", false, false, proto.TaskStatus_Finished, []string{})
		defer close(res)
		if err != nil {
			return err
		}
		var toDelete []string
		var deleted int32
	loop:
		for {
			select {
			case <-done:
				break loop
			case job := <-res:
				if job.AutoStart && job.AutoClean {
					toDelete = append(toDelete, job.ID)
				}
			}
		}

		for _, id := range toDelete {
			if e := j.store.DeleteJob(id); e == nil {
				deleted++
				log.Logger(ctx).Info("Deleting AutoClean Job " + id)
				client.Publish(ctx, client.NewPublication(common.TOPIC_JOB_CONFIG_EVENT, &proto.JobChangeEvent{
					JobRemoved: id,
				}))
				go func() {
					j.DeleteLogsFor(ctx, id, "")
				}()

			}
		}
		response.DeleteCount = deleted
		response.Success = true
	}
	return nil
}

func (j *JobsHandler) ListJobs(ctx context.Context, request *proto.ListJobsRequest, streamer proto.JobService_ListJobsStream) error {

	log.Logger(ctx).Debug("Scheduler ListJobs", zap.Any("req", request))
	defer streamer.Close()

	res, done, err := j.store.ListJobs(request.Owner, request.EventsOnly, request.TimersOnly, request.LoadTasks, request.JobIDs, request.TasksOffset, request.TasksLimit)
	defer close(res)
	if err != nil {
		return err
	}

	for {
		select {
		case <-done:
			return nil
		case j := <-res:
			streamer.Send(&proto.ListJobsResponse{Job: j})
		}
	}
}

//////////////////
// TASKS STORE
/////////////////
func (j *JobsHandler) PutTask(ctx context.Context, request *proto.PutTaskRequest, response *proto.PutTaskResponse) error {

	job, e := j.store.GetJob(request.Task.JobID, 0)
	if e != nil {
		return errors.NotFound(common.SERVICE_JOBS, "Cannot append task to a non existing job ("+request.Task.JobID+")")
	}

	err := j.store.PutTask(request.Task)
	//log.Logger(ctx).Debug("Scheduler PutTask", zap.Any("task", request.Task))
	if err != nil {
		return err
	}
	response.Task = request.Task
	T := lang.Bundle().GetTranslationFunc()
	job.Label = T(job.Label)
	if !job.TasksSilentUpdate {
		client.Publish(ctx, client.NewPublication(common.TOPIC_JOB_TASK_EVENT, &proto.TaskChangeEvent{
			TaskUpdated: request.Task,
			Job:         job,
		}))
	}

	return nil
}

func (j *JobsHandler) PutTaskStream(ctx context.Context, streamer proto.JobService_PutTaskStreamStream) error {

	defer streamer.Close()

	for {
		request, err := streamer.Recv()
		if request == nil {
			break
		}
		if err != nil {
			log.Logger(ctx).Debug("received an error in PutTaskStream", zap.Error(err))
			return err
		}

		//log.Logger(ctx).Debug("PutTaskStream", zap.Any("task", request.Task))
		var response proto.PutTaskResponse
		e := j.PutTask(ctx, request, &response)
		if e != nil {
			streamer.SendMsg(e)
		} else {
			sendErr := streamer.Send(&response)
			if sendErr != nil {
				return e
			}
		}
	}

	return nil
}

func (j *JobsHandler) ListTasks(ctx context.Context, request *proto.ListTasksRequest, streamer proto.JobService_ListTasksStream) error {

	log.Logger(ctx).Debug("Scheduler ListTasks")
	defer streamer.Close()

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
			streamer.Send(&proto.ListTasksResponse{Task: t})
		}
	}
}

func (j *JobsHandler) DeleteTasks(ctx context.Context, request *proto.DeleteTasksRequest, response *proto.DeleteTasksResponse) error {

	// Delete Tasks by Status, either for one job or for all jobs
	if len(request.Status) > 0 {

		toDelete := make(map[string][]string)
		for _, status := range request.Status {

			res, done, err := j.store.ListTasks(request.JobId, status, request.PruneLimit)
			defer close(res)
			if err != nil {
				return err
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
				return e
			}
			response.Deleted = append(response.Deleted, tasks...)
			go func() {
				for _, tId := range tasks {
					j.DeleteLogsFor(ctx, jId, tId)
				}
			}()
		}
		return nil

	} else if request.JobId != "" && len(request.TaskID) > 0 {

		if e := j.store.DeleteTasks(request.JobId, request.TaskID); e == nil {
			response.Deleted = append(response.Deleted, request.TaskID...)
			go func() {
				for _, tId := range request.TaskID {
					j.DeleteLogsFor(ctx, request.JobId, tId)
				}
			}()
			return nil
		} else {
			return e
		}

	} else {

		return errors.BadRequest(common.SERVICE_JOBS, "DeleteTasks: provide either status values or jobId/taskId parameters")

	}

}

func (j *JobsHandler) DeleteLogsFor(ctx context.Context, job string, task string) (int64, error) {
	var req = &log2.ListLogRequest{}
	if task == "" {
		req.Query = "+OperationUuid:\"" + job + "*\""
	} else {
		req.Query = "+OperationUuid:\"" + job + "-" + task[0:8] + "\""
	}
	resp := &log2.DeleteLogsResponse{}
	if e := j.DeleteLogs(ctx, req, resp); e != nil {
		log.Logger(ctx).Error("Deleting logs in background for ", zap.String("j", job), zap.String("t", task), zap.Error(e))
		return 0, e
	} else {
		log.Logger(ctx).Debug("Deleting logs in background for ", zap.String("j", job), zap.String("t", task), zap.Any("count", resp.Deleted))
		return resp.Deleted, nil
	}
}

func (j *JobsHandler) DetectStuckTasks(ctx context.Context, request *proto.DetectStuckTasksRequest, response *proto.DetectStuckTasksResponse) error {

	since := request.Since
	var durations []time.Duration
	if since > 0 {
		durations = append(durations, time.Duration(since)*time.Second)
	}
	tasks, e := j.CleanStuckTasks(ctx, durations...)
	if e != nil {
		return e
	}
	for _, t := range tasks {
		response.FixedTaskIds = append(response.FixedTaskIds, t.ID)
	}

	return nil
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
			if len(duration) > 0 && t.StartTime > 0 {
				check := duration[0]
				startTime := time.Unix(int64(t.StartTime), 0)
				if time.Now().Sub(startTime) > check {
					fixedTasks = append(fixedTasks, t)
				}
			} else {
				fixedTasks = append(fixedTasks, t)
			}
		}
	}

}
