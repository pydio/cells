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
	"encoding/json"
	"fmt"

	"github.com/emicklei/go-restful"
	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"strings"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/jobs"
	log2 "github.com/pydio/cells/common/proto/log"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils/i18n"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/lang"
)

var (
	router *views.Router
)

func getRouter() *views.Router {
	if router == nil {
		router = views.NewStandardRouter(views.RouterOptions{WatchRegistry: true})
	}
	return router
}

// JobsHandler implements methods accessed via the REST gateway to the job definition repository
type JobsHandler struct{}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (s *JobsHandler) SwaggerTags() []string {
	return []string{"JobsService"}
}

// Filter returns a function to filter the swagger path
func (s *JobsHandler) Filter() func(string) string {
	return nil
}

func (s *JobsHandler) UserListJobs(req *restful.Request, rsp *restful.Response) {

	T := lang.Bundle().GetTranslationFunc(i18n.UserLanguagesFromRestRequest(req, config.Default())...)

	var request jobs.ListJobsRequest
	if err := req.ReadEntity(&request); err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	ctx := req.Request.Context()
	cli := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, defaults.NewClient())
	output := &rest.UserJobsCollection{}
	var uName, profile string
	if ctx.Value(claim.ContextKey) != nil {
		claims := ctx.Value(claim.ContextKey).(claim.Claims)
		uName = claims.Name
		profile = claims.Profile
	}
	if request.Owner == "*" && profile == common.PYDIO_PROFILE_ADMIN {
		request.Owner = ""
	} else {
		request.Owner = uName
	}

	streamer, err := cli.ListJobs(ctx, &request)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	defer streamer.Close()
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
		output.Jobs = append(output.Jobs, j)
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
		sName, jC := registry.GetClient(common.SERVICE_JOBS)
		cli := jobs.NewJobServiceClient(sName, jC)
		delRequest := &jobs.DeleteTasksRequest{
			JobId:  cmd.JobId,
			TaskID: []string{cmd.TaskId},
		}
		if response, err := cli.DeleteTasks(ctx, delRequest); err != nil {
			service.RestError500(req, rsp, err)
		} else {
			rsp.WriteEntity(&jobs.CtrlCommandResponse{Msg: fmt.Sprintf("Deleted %v tasks", len(response.Deleted))})
		}

	} else if cmd.Cmd == jobs.Command_RunOnce {

		client.Publish(ctx, client.NewPublication(common.TOPIC_TIMER_EVENT, &jobs.JobTriggerEvent{
			JobID:  cmd.JobId,
			RunNow: true,
		}))

	} else if cmd.Cmd == jobs.Command_Active || cmd.Cmd == jobs.Command_Inactive {

		cli := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, defaults.NewClient())
		if jobResp, err := cli.GetJob(ctx, &jobs.GetJobRequest{JobID: cmd.JobId}); err == nil {

			job := jobResp.Job
			if cmd.Cmd == jobs.Command_Inactive {
				job.Inactive = true
			} else {
				job.Inactive = false
			}
			if _, err := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); err != nil {
				service.RestError500(req, rsp, err)
			} else {
				rsp.WriteEntity(&jobs.CtrlCommandResponse{Msg: "Updated Job State"})
			}

		} else {
			service.RestError500(req, rsp, err)
		}

	} else {
		cli := jobs.NewTaskServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TASKS, defaults.NewClient())
		if response, err := cli.Control(ctx, &cmd); err == nil {
			rsp.WriteEntity(response)
		} else {
			service.RestError500(req, rsp, err)
		}
	}

}

func (s *JobsHandler) UserDeleteTasks(req *restful.Request, rsp *restful.Response) {

	var request jobs.DeleteTasksRequest
	if err := req.ReadEntity(&request); err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	cli := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
	response, e := cli.DeleteTasks(req.Request.Context(), &request)
	if e != nil {
		service.RestError500(req, rsp, e)
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

	ctx := req.Request.Context()
	log.Logger(ctx).Debug("User.CreateJob", zap.Any("r", request))
	languages := i18n.UserLanguagesFromRestRequest(req, config.Default())

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
		break
	case "extract":
		node := jsonParams["node"].(string)
		target := jsonParams["target"].(string)
		format := jsonParams["format"].(string)
		jobUuid, err = extract(ctx, node, target, format, languages...)
		break
	case "remote-download":
		// Reparse json to expected structure
		type params struct {
			Target string
			Urls   []string
		}
		var jsonParams params
		if request.JsonParameters != "" {
			json.Unmarshal([]byte(request.JsonParameters), &jsonParams)
		}
		target := jsonParams.Target
		urls := jsonParams.Urls
		log.Logger(ctx).Info("Wget Task with params", zap.Any("params", jsonParams))
		uuids, e := wgetTasks(ctx, target, urls, languages...)
		jobUuid = strings.Join(uuids, ",")
		err = e
		break
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
		break
	case "datasource-resync":
		dsName := jsonParams["dsName"].(string)
		jobUuid, err = syncDatasource(ctx, dsName, languages...)
		break
	case "import-p8":
		jobUuid, err = p8migration(ctx, request.JsonParameters)
		break
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

// Syslog retrieves the technical logs items matched by the query and export them in JSON, XLSX or CSV format
func (s *JobsHandler) ListTasksLogs(req *restful.Request, rsp *restful.Response) {

	var input log2.ListLogRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	ctx := req.Request.Context()

	c := log2.NewLogRecorderClient(registry.GetClient(common.SERVICE_JOBS))

	res, err := c.ListLogs(ctx, &input)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	defer res.Close()

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
