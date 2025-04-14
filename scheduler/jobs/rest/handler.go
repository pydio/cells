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

package rest

import (
	"context"
	"fmt"
	"strings"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/client/commons/jobsc"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/proto/jobs"
	log2 "github.com/pydio/cells/v5/common/proto/log"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/scheduler/jobs/userspace"
	"github.com/pydio/cells/v5/scheduler/lang"
)

var (
	TODORouter nodes.Client
)

func getRouter() nodes.Client {
	return TODORouter
}

// JobsHandler implements methods accessed via the REST gateway to the job definition repository
type JobsHandler struct {
	RuntimeContext context.Context
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (s *JobsHandler) SwaggerTags() []string {
	return []string{"JobsService"}
}

// Filter returns a function to filter the swagger path
func (s *JobsHandler) Filter() func(string) string {
	return nil
}

func (s *JobsHandler) UserListJobs(req *restful.Request, rsp *restful.Response) error {

	T := lang.Bundle().T(middleware.DetectedLanguages(req.Request.Context())...)

	var request jobs.ListJobsRequest
	if err := req.ReadEntity(&request); err != nil {
		return err
	}
	ctx := req.Request.Context()
	cli := jobsc.JobServiceClient(ctx)
	output := &rest.UserJobsCollection{}
	var uName, profile string
	if claims, ok := claim.FromContext(ctx); ok {
		uName = claims.Name
		profile = claims.Profile
	}
	if request.Owner == "*" && profile == common.PydioProfileAdmin {
		request.Owner = ""
	} else {
		request.Owner = uName
	}

	var hasRunning []string
	loadedJobs := make(map[string]*jobs.Job)

	streamer, err := cli.ListJobs(ctx, &request)

	if err = commons.ForEach(streamer, err, func(resp *jobs.ListJobsResponse) error {
		j := resp.GetJob()
		j.Label = T(j.Label)
		if request.TasksLimit == 1 && len(j.Tasks) > 0 && j.Tasks[0].Status == jobs.TaskStatus_Running {
			hasRunning = append(hasRunning, j.ID)
		}
		output.Jobs = append(output.Jobs, j)
		loadedJobs[j.ID] = j
		return nil
	}); err != nil {
		return err
	}

	// For request.TasksLimit == 1, reload all running tasks to display a correct count
	if len(hasRunning) > 0 {
		stream2, err := cli.ListJobs(ctx, &jobs.ListJobsRequest{
			Owner:      request.Owner,
			EventsOnly: request.EventsOnly,
			TimersOnly: request.TimersOnly,
			LoadTasks:  jobs.TaskStatus_Running,
			JobIDs:     hasRunning,
		})
		fmt.Println("HERE 9", err)
		if er := commons.ForEach(stream2, err, func(resp *jobs.ListJobsResponse) error {
			loadedJobs[resp.Job.ID].Tasks = resp.Job.Tasks
			return nil
		}); er != nil {
			return er
		}
	}

	return rsp.WriteEntity(output)
}

func (s *JobsHandler) UserControlJob(req *restful.Request, rsp *restful.Response) error {

	var cmd jobs.CtrlCommand
	if err := req.ReadEntity(&cmd); err != nil {
		return err
	}
	ctx := req.Request.Context()
	resp, er := SendControlCommand(ctx, &cmd)
	if er != nil {
		return errors.Tag(er, errors.StatusInternalServerError)
	}
	return rsp.WriteEntity(resp)

}

func SendControlCommand(ctx context.Context, cmd *jobs.CtrlCommand) (*jobs.CtrlCommandResponse, error) {
	if cmd.Cmd == jobs.Command_Delete {
		cli := jobsc.JobServiceClient(ctx)
		delRequest := &jobs.DeleteTasksRequest{
			JobId:  cmd.JobId,
			TaskID: []string{cmd.TaskId},
		}
		if response, err := cli.DeleteTasks(ctx, delRequest); err != nil {
			return nil, err
		} else {
			return &jobs.CtrlCommandResponse{Msg: fmt.Sprintf("Deleted %v tasks", len(response.Deleted))}, nil
		}

	} else if cmd.Cmd == jobs.Command_RunOnce {

		broker.MustPublish(ctx, common.TopicTimerEvent, &jobs.JobTriggerEvent{
			JobID:         cmd.JobId,
			RunNow:        true,
			RunTaskId:     cmd.TaskId,
			RunParameters: cmd.RunParameters,
		})
		return &jobs.CtrlCommandResponse{Msg: "message sent"}, nil

	} else if cmd.Cmd == jobs.Command_Active || cmd.Cmd == jobs.Command_Inactive {

		cli := jobsc.JobServiceClient(ctx)
		if jobResp, err := cli.GetJob(ctx, &jobs.GetJobRequest{JobID: cmd.JobId}); err == nil {

			job := jobResp.Job
			if cmd.Cmd == jobs.Command_Inactive {
				job.Inactive = true
			} else {
				job.Inactive = false
			}
			if _, err := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); err != nil {
				return nil, err
			} else {
				return &jobs.CtrlCommandResponse{Msg: "Updated Job State"}, nil
			}

		} else {
			return nil, err
		}

	} else {

		cli := jobs.NewTaskServiceClient(grpc.ResolveConn(ctx, common.ServiceTasksGRPC))
		return cli.Control(ctx, cmd)

	}

}

func (s *JobsHandler) UserDeleteTasks(req *restful.Request, rsp *restful.Response) error {

	var request jobs.DeleteTasksRequest
	if err := req.ReadEntity(&request); err != nil {
		return err
	}

	ctx := req.Request.Context()
	response, e := jobsc.JobServiceClient(ctx).DeleteTasks(ctx, &request)
	if e != nil {
		return e
	}

	return rsp.WriteEntity(response)

}

func (s *JobsHandler) UserCreateJob(req *restful.Request, rsp *restful.Response) error {

	var request rest.UserJobRequest
	err := req.ReadEntity(&request)
	if err != nil {
		return err
	}
	if request.JobName == "" {
		request.JobName = req.PathParameter("JobName")
	}

	ctx := req.Request.Context()
	log.Logger(ctx).Debug("User.CreateJob", zap.Any("r", &request))
	ll := middleware.DetectedLanguages(ctx)

	jsonParams := make(map[string]interface{})
	if request.JsonParameters != "" {
		if er := json.Unmarshal([]byte(request.JsonParameters), &jsonParams); er != nil {
			return errors.Tag(er, errors.UnmarshalError)
		}
	}
	router := getRouter()

	var job *jobs.Job
	var multipleIds []string

	log.Logger(ctx).Debug("User.CreateJob", zap.Any("p", jsonParams))

	switch request.JobName {
	case "compress":
		var nn []string
		for _, i := range jsonParams["nodes"].([]interface{}) {
			nn = append(nn, i.(string))
		}
		archiveName := jsonParams["archiveName"].(string)
		format := jsonParams["format"].(string)
		job, err = userspace.CompressTask(ctx, router, nn, archiveName, format, ll...)
	case "extract":
		node := jsonParams["node"].(string)
		target := jsonParams["target"].(string)
		format := jsonParams["format"].(string)
		job, err = userspace.ExtractTask(ctx, router, node, target, format, ll...)
	case "remote-download":
		// Reparse json to expected structure
		type params struct {
			Target string
			Urls   []string
		}
		var structParams params
		if request.JsonParameters != "" {
			_ = json.Unmarshal([]byte(request.JsonParameters), &structParams)
		}
		target := structParams.Target
		urls := structParams.Urls
		log.Logger(ctx).Info("Wget Task with params", zap.Any("params", structParams))
		jj, e := userspace.WgetTask(ctx, router, target, urls, ll...)
		for _, j := range jj {
			multipleIds = append(multipleIds, j.ID)
		}
		err = e
	case "copy", "move":
		var nn []string
		for _, i := range jsonParams["nodes"].([]interface{}) {
			nn = append(nn, i.(string))
		}
		target := jsonParams["target"].(string)
		var targetIsParent bool
		if p, ok := jsonParams["targetParent"]; ok && p == true {
			targetIsParent = true
		}
		move := false
		if request.JobName == "move" {
			move = true
		}
		job, err = userspace.CopyMoveTask(ctx, router, nn, target, targetIsParent, move, ll...)
	case "datasource-resync":
		dsName := jsonParams["dsName"].(string)
		job, err = userspace.SyncDatasourceTask(ctx, dsName, ll...)
	case "import-p8":
		job, err = userspace.P8migrationTask(ctx, request.JsonParameters)
	default:
		err = errors.WithMessagef(errors.InvalidParameters, "unknown job name %s", request.JobName)
	}

	if err != nil {
		return err
	}

	if len(multipleIds) > 0 {
		return rsp.WriteEntity(&rest.UserJobResponse{
			JobUuid: strings.Join(multipleIds, ","),
		})
	} else if job != nil {
		return rsp.WriteEntity(&rest.UserJobResponse{JobUuid: job.ID})
	} else {
		return errors.WithMessage(errors.StatusInternalServerError, "no job triggered after action")
	}

}

// ListTasksLogs retrieves the logs attached to a specific task
func (s *JobsHandler) ListTasksLogs(req *restful.Request, rsp *restful.Response) error {

	var input log2.ListLogRequest
	if e := req.ReadEntity(&input); e != nil {
		return e
	}
	ctx := req.Request.Context()

	c := log2.NewLogRecorderClient(grpc.ResolveConn(ctx, common.ServiceJobsGRPC))

	logColl := &rest.LogMessageCollection{}
	res, err := c.ListLogs(ctx, &input)
	err = commons.ForEach(res, err, func(t *log2.ListLogResponse) error {
		logColl.Logs = append(logColl.Logs, t.GetLogMessage())
		return nil
	})
	if err != nil {
		return err
	}
	return rsp.WriteEntity(logColl)

}
