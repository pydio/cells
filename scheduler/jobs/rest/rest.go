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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/jobs"
	log2 "github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/i18n"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/scheduler/lang"
)

var (
	router nodes.Client
)

func getRouter() nodes.Client {
	return router
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

func (s *JobsHandler) UserListJobs(req *restful.Request, rsp *restful.Response) {

	T := lang.Bundle().GetTranslationFunc(i18n.UserLanguagesFromRestRequest(req, config.Get())...)

	var request jobs.ListJobsRequest
	if err := req.ReadEntity(&request); err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	ctx := req.Request.Context()
	cli := jobs.NewJobServiceClient(grpc.ResolveConn(ctx, common.ServiceJobs))
	output := &rest.UserJobsCollection{}
	var uName, profile string
	if ctx.Value(claim.ContextKey) != nil {
		claims := ctx.Value(claim.ContextKey).(claim.Claims)
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
	if err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		j := resp.GetJob()
		j.Label = T(j.Label)
		if request.TasksLimit == 1 && len(j.Tasks) > 0 && j.Tasks[0].Status == jobs.TaskStatus_Running {
			hasRunning = append(hasRunning, j.ID)
		}
		output.Jobs = append(output.Jobs, j)
		loadedJobs[j.ID] = j
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
		if err == nil {
			defer stream2.CloseSend()
			for {
				resp, e := stream2.Recv()
				if e != nil {
					break
				}
				if resp == nil {
					continue
				}
				// Update running tasks
				loadedJobs[resp.Job.ID].Tasks = resp.Job.Tasks
			}
		}
	}
	rsp.WriteEntity(output)
}

func (s *JobsHandler) UserControlJob(req *restful.Request, rsp *restful.Response) {

	var cmd jobs.CtrlCommand
	if err := req.ReadEntity(&cmd); err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	ctx := req.Request.Context()
	if cmd.Cmd == jobs.Command_Delete {
		cli := jobs.NewJobServiceClient(grpc.ResolveConn(ctx, common.ServiceJobs))
		delRequest := &jobs.DeleteTasksRequest{
			JobId:  cmd.JobId,
			TaskID: []string{cmd.TaskId},
		}
		if response, err := cli.DeleteTasks(ctx, delRequest); err != nil {
			service.RestErrorDetect(req, rsp, err)
		} else {
			rsp.WriteEntity(&jobs.CtrlCommandResponse{Msg: fmt.Sprintf("Deleted %v tasks", len(response.Deleted))})
		}

	} else if cmd.Cmd == jobs.Command_RunOnce {

		broker.MustPublish(ctx, common.TopicTimerEvent, &jobs.JobTriggerEvent{
			JobID:         cmd.JobId,
			RunNow:        true,
			RunTaskId:     cmd.TaskId,
			RunParameters: cmd.RunParameters,
		})

	} else if cmd.Cmd == jobs.Command_Active || cmd.Cmd == jobs.Command_Inactive {

		cli := jobs.NewJobServiceClient(grpc.ResolveConn(ctx, common.ServiceJobs))
		if jobResp, err := cli.GetJob(ctx, &jobs.GetJobRequest{JobID: cmd.JobId}); err == nil {

			job := jobResp.Job
			if cmd.Cmd == jobs.Command_Inactive {
				job.Inactive = true
			} else {
				job.Inactive = false
			}
			if _, err := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); err != nil {
				service.RestErrorDetect(req, rsp, err)
			} else {
				rsp.WriteEntity(&jobs.CtrlCommandResponse{Msg: "Updated Job State"})
			}

		} else {
			service.RestErrorDetect(req, rsp, err)
		}

	} else {
		cli := jobs.NewTaskServiceClient(grpc.ResolveConn(ctx, common.ServiceTasks))
		if response, err := cli.Control(ctx, &cmd); err == nil {
			rsp.WriteEntity(response)
		} else {
			service.RestErrorDetect(req, rsp, err)
		}
	}

}

func (s *JobsHandler) UserDeleteTasks(req *restful.Request, rsp *restful.Response) {

	var request jobs.DeleteTasksRequest
	if err := req.ReadEntity(&request); err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	cli := jobs.NewJobServiceClient(grpc.ResolveConn(req.Request.Context(), common.ServiceJobs))
	response, e := cli.DeleteTasks(req.Request.Context(), &request)
	if e != nil {
		service.RestErrorDetect(req, rsp, e)
		return
	}

	rsp.WriteEntity(response)

}

func (s *JobsHandler) UserCreateJob(req *restful.Request, rsp *restful.Response) {

	var request rest.UserJobRequest
	err := req.ReadEntity(&request)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	if request.JobName == "" {
		request.JobName = req.PathParameter("JobName")
	}

	ctx := req.Request.Context()
	log.Logger(ctx).Debug("User.CreateJob", zap.Any("r", &request))
	languages := i18n.UserLanguagesFromRestRequest(req, config.Get())

	jsonParams := make(map[string]interface{})
	if request.JsonParameters != "" {
		json.Unmarshal([]byte(request.JsonParameters), &jsonParams)
	}

	var jobUuid string

	log.Logger(ctx).Debug("User.CreateJob", zap.Any("p", jsonParams))

	switch request.JobName {
	case "compress":
		var nodes []string
		for _, i := range jsonParams["nodes"].([]interface{}) {
			nodes = append(nodes, i.(string))
		}
		archiveName := jsonParams["archiveName"].(string)
		format := jsonParams["format"].(string)
		jobUuid, err = compress(ctx, nodes, archiveName, format, languages...)
	case "extract":
		node := jsonParams["node"].(string)
		target := jsonParams["target"].(string)
		format := jsonParams["format"].(string)
		jobUuid, err = extract(ctx, node, target, format, languages...)
	case "remote-download":
		// Reparse json to expected structure
		type params struct {
			Target string
			Urls   []string
		}
		var structParams params
		if request.JsonParameters != "" {
			json.Unmarshal([]byte(request.JsonParameters), &structParams)
		}
		target := structParams.Target
		urls := structParams.Urls
		log.Logger(ctx).Info("Wget Task with params", zap.Any("params", structParams))
		uuids, e := wgetTasks(ctx, target, urls, languages...)
		jobUuid = strings.Join(uuids, ",")
		err = e
	case "copy", "move":
		var nodes []string
		for _, i := range jsonParams["nodes"].([]interface{}) {
			nodes = append(nodes, i.(string))
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
		jobUuid, err = dirCopy(ctx, nodes, target, targetIsParent, move, languages...)
	case "datasource-resync":
		dsName := jsonParams["dsName"].(string)
		jobUuid, err = syncDatasource(ctx, dsName, languages...)
	case "import-p8":
		jobUuid, err = p8migration(ctx, request.JsonParameters)
	default:
		service.RestError500(req, rsp, fmt.Errorf("unknown job name"))
	}

	if err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}

	response := &rest.UserJobResponse{
		JobUuid: jobUuid,
	}
	rsp.WriteEntity(response)

}

// ListTasksLogs retrieves the logs attached to a specific task
func (s *JobsHandler) ListTasksLogs(req *restful.Request, rsp *restful.Response) {

	var input log2.ListLogRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	ctx := req.Request.Context()

	c := log2.NewLogRecorderClient(grpc.ResolveConn(ctx, common.ServiceJobs))

	res, err := c.ListLogs(ctx, &input)
	if err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}
	defer res.CloseSend()

	logColl := &rest.LogMessageCollection{}
	for {
		response, err := res.Recv()
		if err != nil {
			break
		}
		logColl.Logs = append(logColl.Logs, response.GetLogMessage())
	}

	rsp.WriteEntity(logColl)

}
